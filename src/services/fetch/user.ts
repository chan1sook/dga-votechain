import { FilterQuery } from "mongoose";
import UserModel from "~/src/models/user";
import { escapeRegExp } from "~/src/services/formatter/regexp";

export async function getActiveUserByAuthSource(authSource: UserAuthSourceData) {
  const userDoc = await UserModel.findOne({
    authSources: { $elemMatch: authSource },
    removeAt: { $exists: false },
  })

  return userDoc;
}
export async function getActiveUserByEmail(email?: string) {
  if(!email) {
    return null;
  }
  
  const userDoc = await UserModel.findOne({
    email,
    removeAt: { $exists: false },
  });

  return userDoc;
}

export function searchUsers(params: UserSearchParams) {
  let docQuery : FilterQuery<UserModelData> = {};
  if(params.keyword) {
    const regExp = new RegExp(escapeRegExp(params.keyword));
    docQuery.$or = [
      { firstName: regExp },
      { lastName: regExp },
      { email: regExp }
    ]
  };
  
  if(params.adminOnly === true) {
    docQuery.permissions = "admin-mode";
  }

  if(params.notSelf === true) {
    docQuery._id = { $ne : params.userid };
  }
  
  return UserModel.find(docQuery);
}