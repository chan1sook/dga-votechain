import { FilterQuery, isValidObjectId } from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

import UserModel from "~/src/models/user";
import { isThaiCitizenId, splitBasicName } from "../validations/user";
import { ObjectId } from "mongodb";
import { isUserAdmin } from "../validations/role";

export async function getActiveUserByAuthSource(
  authSource: UserAuthSourceData
) {
  const userDoc = await UserModel.findOne({
    authSources: { $elemMatch: authSource },
    removeAt: { $exists: false },
  });

  return userDoc;
}

export async function getActiveUserByEmail(email?: string) {
  if (!email) {
    return null;
  }

  const userDoc = await UserModel.findOne({
    email,
    removeAt: { $exists: false },
  });

  return userDoc;
}

export async function getActiveUserByCitizenID(citizenId: string) {
  if (!isThaiCitizenId(citizenId)) {
    return null;
  }

  // Since use fixed salt => hashed value alway same => fast search by hash again
  const cidHashed = await bcrypt.hash(
    citizenId,
    useRuntimeConfig().CITIZENID_FIXED_SALT
  );

  const user = await UserModel.findOne({
    cidHashed: cidHashed,
    removeAt: { $exists: false },
  });

  return user;
}

async function getCitizenIDSearchQuery(params: UserSearchParams) {
  // Since use fixed salt => hashed value alway same => fast search by hash again
  const cidHashed = await bcrypt.hash(
    params.keyword,
    useRuntimeConfig().CITIZENID_FIXED_SALT
  );

  let docQuery: FilterQuery<UserModelData> = {
    cidHashed: cidHashed,
    removeAt: { $exists: false },
  };

  if (params.adminOnly === true) {
    docQuery.permissions = "admin-mode";
  }

  if (params.excludeUserId) {
    docQuery._id = { $ne: params.excludeUserId };
  }

  return docQuery;
}

function getEmailSearchQuery(params: UserSearchParams) {
  let docQuery: FilterQuery<UserModelData> = {
    email: params.keyword,
    removeAt: { $exists: false },
  };

  if (params.adminOnly === true) {
    docQuery.permissions = "admin-mode";
  }

  if (params.excludeUserId) {
    docQuery._id = { $ne: params.excludeUserId };
  }

  return docQuery;
}

function getUserIdSearchQuery(params: UserSearchParams) {
  let docQuery: FilterQuery<UserModelData> = {
    _id: new ObjectId(params.keyword),
    removeAt: { $exists: false },
  };

  if (params.adminOnly === true) {
    docQuery.permissions = "admin-mode";
  }

  return docQuery;
}

function getNameSearchQuery(params: UserSearchParams) {
  let docQuery: FilterQuery<UserModelData> = {
    firstName: "",
    lastName: "",
    removeAt: { $exists: false },
  };

  const nameToken = splitBasicName(params.keyword);

  if (nameToken.length === 3) {
    docQuery.firstName = nameToken[0];
    docQuery.lastName = nameToken[2];
  } else if (nameToken.length === 2) {
    docQuery.firstName = nameToken[0];
    docQuery.lastName = nameToken[1];
  } else if (nameToken.length === 1) {
    docQuery.firstName = nameToken[0];
  }

  if (params.adminOnly === true) {
    docQuery.permissions = "admin-mode";
  }

  return docQuery;
}

export async function searchExactActiveUserByKeyword(params: UserSearchParams) {
  let docQuery: FilterQuery<UserModelData> = {};

  if (!params.keyword) {
    return null;
  } else if (isThaiCitizenId(params.keyword)) {
    docQuery = await getCitizenIDSearchQuery(params);
  } else if (isValidObjectId(params.keyword)) {
    if (
      params.excludeUserId &&
      params.keyword === params.excludeUserId.toString()
    ) {
      return null;
    }
    docQuery = getUserIdSearchQuery(params);
  } else if (!validator.isEmail(params.keyword)) {
    docQuery = getNameSearchQuery(params);
  } else {
    docQuery = getEmailSearchQuery(params);
  }

  return await UserModel.findOne(docQuery);
}

export async function batchSearchActiveUserByKeywords(
  searchParams: CSVSearchParams[],
  { adminOnly, excludeUserId }: Omit<UserSearchParams, "keyword">
) {
  const unsearchParams = searchParams.slice();
  const matchResults: {
    user: UserModelDataWithId;
    vote: number | undefined;
  }[] = [];

  const cursor = UserModel.find({
    removeAt: { $exists: false },
  }).cursor();

  let nextUser = await cursor.next();
  while (nextUser) {
    if (adminOnly && !isUserAdmin(nextUser)) {
      nextUser = await cursor.next();
      continue;
    }

    if (excludeUserId && nextUser._id.toString() === excludeUserId.toString()) {
      nextUser = await cursor.next();
      continue;
    }

    for (let i = 0; i < unsearchParams.length; i++) {
      const params = unsearchParams[i];
      if (params.citizenid && isThaiCitizenId(params.citizenid)) {
        const cidHashed = await bcrypt.hash(
          params.citizenid,
          useRuntimeConfig().CITIZENID_FIXED_SALT
        );
        if (nextUser.cidHashed === cidHashed) {
          matchResults.push({
            user: nextUser,
            vote: params.voteCount,
          });
          unsearchParams.splice(i, 1);
          break;
        }
      } else if (params.names) {
        const nameToken = splitBasicName(params.names);
        let valid = false;
        if (nameToken.length === 3) {
          valid =
            nextUser.firstName === nameToken[0] &&
            nextUser.lastName === nameToken[2];
        } else if (nameToken.length === 2) {
          valid =
            nextUser.firstName === nameToken[0] &&
            nextUser.lastName === nameToken[1];
        } else if (nameToken.length === 1) {
          valid = nextUser.firstName === nameToken[0] && !nextUser.lastName;
        }

        if (valid) {
          matchResults.push({
            user: nextUser,
            vote: params.voteCount,
          });
          unsearchParams.splice(i, 1);
          break;
        }
      } else if (params.email && validator.isEmail(params.email)) {
        if (nextUser.email === params.email) {
          matchResults.push({
            user: nextUser,
            vote: params.voteCount,
          });
          unsearchParams.splice(i, 1);
          break;
        }
      }
    }

    if (unsearchParams.length === 0) {
      break;
    }

    nextUser = await cursor.next();
  }

  return matchResults;
}
