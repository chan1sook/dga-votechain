import { checkPermissionSelections } from "~~/src/utils/permissions";
import dayjs from "dayjs";

import EVoteUserModel from "~~/server/models/user"
import VoteModel from "~~/server/models/vote"

export async function getTxArr(pagesize: number, startid: string) {
  let txDocs : Array<TxResponseData & { tx: string | null }> = [];
  const _txDocs : Array<VoteData> = await VoteModel.getLastestVotes(pagesize, startid);
  for(const fakeTx of _txDocs) {
    txDocs.push({
      voteid: `${fakeTx._id}`,
      topicid: fakeTx.topicid.toString(),
      userid: fakeTx.userid.toString(),
      choice: fakeTx.choice === "" ? null : fakeTx.choice,
      createdAt: dayjs(fakeTx.createdAt).toString(),
      valid: Boolean(fakeTx.tx),
      mined: Boolean(fakeTx.tx),
      tx: fakeTx.tx,
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