import dayjs from "dayjs";

import VoteModel from "~~/server/models/vote"

export default defineEventHandler(async (event) => { 
  const voteDoc = await VoteModel.findById(event.context.params?.id);
  if(!voteDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "TX not found",
    });
  }

  const tx: TxResponseData =  {
    _id: `${voteDoc._id}`,
    userid: voteDoc.userid,
    citizenId: voteDoc.citizenId,
    topicid: `${voteDoc.topicid}`,
    choice: voteDoc.choice,
    createdAt: dayjs(voteDoc.createdAt).toString()
  }
  
  return {
    tx,
  }
})