import { checkPermissionSelections } from "~~/src/utils/permissions";
import dayjs from "dayjs";

import EVoteUserModel from "~~/server/models/user"
import VoteModel from "~~/server/models/vote"
import { ObjectId } from "mongodb";

export async function getTxArr(pagesize: number, startid: string) {
  let txDocs : Array<TxResponseData> = [];
  const _txDocs : Array<VoteData> = await VoteModel.getLastestVotes(pagesize, startid);
  for(const fakeTx of _txDocs) {
    txDocs.push({
      voteId: `${fakeTx._id}`,
      topicId: fakeTx.topicid.toString(),
      userId: fakeTx.userid.toString(),
      choice: fakeTx.choice === "" ? null : fakeTx.choice,
      createdAt: dayjs(fakeTx.createdAt).toString(),
      txhash: fakeTx.tx,
      txStatus: !fakeTx.tx ? "invalid" : "valid",
    });
  }

  return txDocs;
}

export async function getUserByAuthSource(authSource: UserAuthSource) {
  const userDoc = await EVoteUserModel.findOne({
    authSources: { $elemMatch: authSource }
  })

  if(userDoc && checkPermissionSelections(userDoc.permissions, "banned")) {
    throw new Error("Forbidden: Banned");
  }

  return userDoc;
}

export async function getUserByCitizenId(citiezenId: string) {
  const userDoc = await EVoteUserModel.findOne({
    citizenId: citiezenId
  })

  if(userDoc && checkPermissionSelections(userDoc.permissions, "banned")) {
    throw new Error("Forbidden: Banned");
  }

  return userDoc;
}