import dayjs from "dayjs";
import { Types } from "mongoose";
import { queryVoteDatasByIdFromBlockchain } from "~~/server/hyperledger-rpc";

import VoteModel from "~~/server/models/vote"

export default defineEventHandler(async (event) => {
  if(!event.context.params?.id) {
    throw createError({
      statusCode: 404,
      statusMessage: "TX not found",
    });
  }
  
  let txData: TxResponseData | undefined;
  try {
    const _txData = await queryVoteDatasByIdFromBlockchain(event.context.params?.id);
    const voteid = new Types.ObjectId(_txData.VoteID);
    txData = {
      VoteID: `${_txData.VoteID}`,
      UserID: `${_txData.UserID}`,
      TopicID: `${_txData.TopicID}`,
      Choice: _txData.Choice === "" ? null : _txData.Choice,
      BookmarkID: _txData.BookmarkID,
      CreatedAt: dayjs(voteid.getTimestamp()).toString(),
      Mined: true,
    }
  } catch(_err) {
    console.error(_err);
    const voteDoc : VoteData & { _id: Types.ObjectId } | null = await VoteModel.findById(event.context.params?.id);   
    if(voteDoc) {
      txData = {
        VoteID: `${voteDoc._id}`,
        UserID: voteDoc.topicid.toString(),
        TopicID: voteDoc.userid.toString(),
        Choice: voteDoc.choice === "" ? null : voteDoc.choice,
        CreatedAt: dayjs(voteDoc.createdAt).toString(),
        Mined: true,
      }
    }

    if(!txData) {
      throw createError({
        statusCode: 404,
        statusMessage: "TX not found",
      });
    }
  }

  return txData;
})