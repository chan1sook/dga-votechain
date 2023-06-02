import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";

import VoteModel from "~/src/models/vote"
import { getVoteOnBlockchain, getTransactionByHash } from "~~/server/smart-contract";

export default defineEventHandler(async (event) => {
  if(!event.context.params?.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vote ID required",
    });
  }
  
  let txData: TxResponseDataWithRaw | undefined;
  const voteDoc : VoteModelDataWithId | null = await VoteModel.findById(event.context.params?.id);
  if(!voteDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Vote ID not found",
    });
  }

  try {
    if(!voteDoc.tx) {
      throw new Error("Tx Ref not found");
    }

    const [blockchainData, transactionInfo]  = await Promise.all(
      [
        getVoteOnBlockchain(voteDoc._id.toString()),
        getTransactionByHash(voteDoc.tx)
      ]
    );

    const valid = blockchainData.voteId === event.context.params?.id && ObjectId.isValid(blockchainData.voteId);
    txData = {
      voteId: blockchainData.voteId,
      topicId: blockchainData.topicId,
      userId: blockchainData.userId,
      choice: blockchainData.choice === "" ? null : blockchainData.choice,
      createdAt: valid ? new Types.ObjectId(blockchainData.voteId).getTimestamp().toString() : undefined,
      txhash: voteDoc.tx,
      txStatus: valid ? "valid" : "invalid",
      txData: transactionInfo,
    }
  } catch(_err) {
    console.error(_err); 
    txData = {
      voteId: `${voteDoc._id}`,
      topicId: voteDoc.topicid.toString(),
      userId: voteDoc.userid ? voteDoc.userid.toString() : "",
      choice: voteDoc.choice === "" ? null : voteDoc.choice,
      createdAt: dayjs(voteDoc.createdAt).toString(),
      txhash: voteDoc.tx,
      txStatus: "invalid",
    }
  }

  if(!txData) {
    throw createError({
      statusCode: 404,
      statusMessage: "TX not found",
    });
  }

  return txData;
})