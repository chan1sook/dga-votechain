import dayjs from "dayjs"

import VoteModel from "~~/src/models/vote"

export default defineEventHandler(async (event) => {
  const { keyword, pagesize, startid } : TxChainQueryParams = getQuery(event);

  const txDocs = await VoteModel.getLastestVotes(pagesize, startid, keyword);
  const txChain : Array<TxResponseData> = txDocs.map((tx) => {
    return {
      _id: `${tx._id}`,
      userid: tx.userid,
      topicid: `${tx.topicid}`,
      choice: tx.choice,
      createdAt: dayjs(tx.createdAt).toString(),
    }
  });

  return {
    txChain,
  }
})