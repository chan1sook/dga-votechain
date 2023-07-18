import dayjs from "dayjs";
import VoteModel from "~/src/models/vote";
import { getLastestVotes } from "~/src/services/fetch/vote";

export async function getTxListFilter(pagesize: number, startid: string) {
  let txDocs: TxResponseData[] = [];
  const _txDocs: VoteModelDataWithId[] = await getLastestVotes(
    pagesize,
    startid
  );
  for (const tx of _txDocs) {
    txDocs.push({
      voteId: tx._id.toString(),
      topicId: tx.topicid.toString(),
      userId: tx.userid ? tx.userid.toString() : "",
      groupid: tx.groupid,
      choice: tx.choice === "" ? null : tx.choice,
      createdAt: dayjs(tx.createdAt).toString(),
      txhash: tx.tx,
      txStatus: !tx.tx ? "invalid" : "valid",
    });
  }

  return txDocs;
}

export async function getTxStats() {
  const txCursor = VoteModel.find().cursor();
  let tx = await txCursor.next();
  const result = {
    mined: 0,
    invalid: 0,
    pending: 0,
    total: 0,
  };
  while (tx) {
    result.total += 1;
    const txStatus = !tx.tx ? "invalid" : "valid";
    switch (txStatus) {
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
