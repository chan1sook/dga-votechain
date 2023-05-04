import { Types } from "mongoose";
import { queryVoteDatasFromBlockchain } from "./hyperledger-rpc";
import dayjs from "dayjs";

import VoteModel from "~~/server/models/vote"

export async function getTxArr(pagesize: number, startid: string) {
  let txDocs : Array<TxResponseData> = [];
  try {
    const _txDocs = await queryVoteDatasFromBlockchain(pagesize, startid);
    txDocs = _txDocs.map((tx) => {
      const voteid = new Types.ObjectId(tx.VoteID);
      return {
        VoteID: `${tx.VoteID}`,
        UserID: `${tx.UserID}`,
        TopicID: `${tx.TopicID}`,
        Choice: tx.Choice === "" ? null : tx.Choice,
        BookmarkID: tx.BookmarkID,
        CreatedAt: dayjs(voteid.getTimestamp()).toString(),
        Mined: true,
      }
    })
  } catch(err) {
    console.error(err);
  }

  const _txDocs : Array<VoteData> = await VoteModel.getLastestVotes(pagesize, startid);
  for(const fakeTx of _txDocs) {
    if(!txDocs.find((ele) => ele.VoteID === fakeTx._id?.toString())) {
      txDocs.push({
        VoteID: `${fakeTx._id}`,
        TopicID: fakeTx.topicid.toString(),
        UserID: fakeTx.userid.toString(),
        Choice: fakeTx.choice || "",
        CreatedAt: dayjs(fakeTx.createdAt).toString(),
        Mined: true,
      });
    }
  }
  
  txDocs.sort((a, b) => {
    return dayjs(b.CreatedAt).valueOf() - dayjs(a.CreatedAt).valueOf();
  });

  return txDocs;
}