import { checkPermissionSelections } from "~~/src/utils/permissions";
import dayjs from "dayjs";

import EVoteUserModel from "~~/server/models/user"
import VoteModel from "~~/server/models/vote"

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

export async function getTxCounts() {
  const txCursor = VoteModel.find().cursor();
  let tx = await txCursor.next();
  const result = {
    mined: 0,
    invalid: 0,
    pending: 0,
    total: 0,
  }
  while(tx) {
    result.total += 1;
    const txStatus = !tx.tx ? "invalid" : "valid";
    switch(txStatus) {
      case "invalid":
        result.invalid += 1;
        break;
      case "valid":
        result.mined += 1;
        break;
    }
    tx = await txCursor.next();
  }

  return result;
}

export async function getUserByAuthSource(authSource: UserAuthSourceData) {
  const userDoc = await EVoteUserModel.findOne({
    authSources: { $elemMatch: authSource }
  })

  return userDoc;
}
export async function getUserByEmail(email?: string) {
  if(!email) {
    return null;
  }
  
  const userDoc = await EVoteUserModel.findOne({
    email,
  });

  return userDoc;
}