import dayjs from "dayjs";

import UserModel from "~/src/models/user"
import VoteModel from "~/src/models/vote"
import { getLastestVotes } from "~/src/services/fetch/vote";

export async function getTxArr(pagesize: number, startid: string) {
  let txDocs : TxResponseData[] = [];
  const _txDocs : VoteModelDataWithId[] = await getLastestVotes(pagesize, startid);
  for(const fakeTx of _txDocs) {
    txDocs.push({
      voteId: fakeTx._id.toString(),
      topicId: fakeTx.topicid.toString(),
      userId: fakeTx.userid ? fakeTx.userid.toString() : "",
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
  const userDoc = await UserModel.findOne({
    authSources: { $elemMatch: authSource }
  })

  return userDoc;
}
export async function getUserByEmail(email?: string) {
  if(!email) {
    return null;
  }
  
  const userDoc = await UserModel.findOne({
    email,
  });

  return userDoc;
}