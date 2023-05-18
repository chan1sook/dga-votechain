import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";

import VoteModel from "~~/server/models/vote"
import { getVoteOnBlockchain } from "~~/server/smart-contract";

export default defineEventHandler(async (event) => {
  if(!event.context.params?.id) {
    throw createError({
      statusCode: 404,
      statusMessage: "TX not found",
    });
  }
  
  let txData: TxResponseData | undefined;
  try {
    const blockchainData = await getVoteOnBlockchain(event.context.params?.id);
    const valid = blockchainData.voteid === event.context.params?.id && ObjectId.isValid(blockchainData.voteid);
    txData = {
      ...blockchainData,
      choice: blockchainData.choice === "" ? null : blockchainData.choice,
      createdAt: valid ? new Types.ObjectId(blockchainData.voteid).getTimestamp().toString() : undefined,
      valid,
      mined: valid,
    }
  } catch(_err) {
    console.error(_err);
    const voteDoc : VoteData & { _id: Types.ObjectId } | null = await VoteModel.findById(event.context.params?.id);   
    if(voteDoc) {
      txData = {
        voteid: `${voteDoc._id}`,
        topicid: voteDoc.topicid.toString(),
        userid: voteDoc.userid.toString(),
        choice: voteDoc.choice === "" ? null : voteDoc.choice,
        createdAt: dayjs(voteDoc.createdAt).toString(),
        valid: false,
        mined: false,
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