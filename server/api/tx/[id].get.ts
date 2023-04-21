import dayjs from "dayjs";

import VoteModel from "~~/server/models/vote"

export default defineEventHandler(async (event) => {
  const voteDoc : TxResponseDataWithPopulated | null = await VoteModel.findById(event.context.params?.id).populate("userid topicid");
  if(!voteDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "TX not found",
    });
  }

  const tx: TxResponseDataWithPopulated =  {
    _id: `${voteDoc._id}`,
    userid: {
      _id: `${voteDoc.userid._id}`,
      firstName: voteDoc.userid.firstName,
      lastName: voteDoc.userid.lastName,
      email: voteDoc.userid.email,
    },
    topicid: {
      _id: `${voteDoc.topicid._id}`,
      name: voteDoc.topicid.name,
      voteStartAt: dayjs(voteDoc.topicid.voteStartAt).toISOString(),
      voteExpiredAt:  dayjs(voteDoc.topicid.voteExpiredAt).toISOString(),
    },
    choice: voteDoc.choice,
    createdAt: dayjs(voteDoc.createdAt).toString()
  }
  
  return tx;
})