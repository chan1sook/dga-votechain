import { Types } from "mongoose";
import dayjs from "dayjs";

import TopicModel from "~~/src/models/topic"
import VoteModel from "~~/src/models/vote"
import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionNeeds(userData.permissions, "vote-topic")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const voteFormData : VoteFormData = await readBody(event);

  const topicDoc = await TopicModel.findById(voteFormData.topicid);
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }
  const voteDoc = await VoteModel.findOne({ userid: userData.userid, topicid: topicDoc._id });
  if(voteDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Can't vote again",
    });
  }
  
  const voteData : VoteData = {
    userid: userData.userid,
    topicid: new Types.ObjectId(voteFormData.topicid),
    choice: voteFormData.choice,
    createdAt: new Date(),
  };

  const newVoteDoc = await new VoteModel(voteData).save();
  const vote : VoteResponseData = {
    _id: `${newVoteDoc._id}`,
    userid: newVoteDoc.userid,
    topicid: `${newVoteDoc.topicid}`,
    choice: newVoteDoc.choice,
    createdAt: dayjs(newVoteDoc.createdAt).toString(),
  }
  
  return {
    vote,
  }
})