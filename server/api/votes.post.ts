import { Types } from "mongoose";
import dayjs from "dayjs";

import TopicModel from "~~/server/models/topic"
import VoteModel from "~~/server/models/vote"

import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { getNtpTime } from "~~/server/ntp";

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
  
  const voteAllowData = topicDoc.voterAllows.find((ele) => ele.citizenId === userData.digitalIdUserInfo.citizen_id);
  if(!voteAllowData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const remainVotes = voteAllowData.remainVotes;
  if(remainVotes <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Can't vote anymore",
    });
  }
  if(voteFormData.votes.length > voteAllowData.remainVotes) {
    voteFormData.votes = voteFormData.votes.slice(0, voteAllowData.remainVotes);
  }
  voteAllowData.remainVotes -= voteFormData.votes.length;

  const today = await getNtpTime();
  const voteDatas : Array<VoteData> = voteFormData.votes.map((choice) => {
    return {
      userid: userData.userid,
      citizenId: userData.digitalIdUserInfo.citizen_id,
      topicid: new Types.ObjectId(voteFormData.topicid),
      choice: choice,
      createdAt: today,
    }
  });

  const [docs] = await Promise.all([
    VoteModel.insertMany(voteDatas),
    topicDoc.save(),
  ]);
  
  const votes : Array<VoteResponseData> = docs.map((newVoteDoc) => {
    return {
      _id: `${newVoteDoc._id}`,
      userid: newVoteDoc.userid,
      citizenId: userData.digitalIdUserInfo.citizen_id,
      topicid: `${newVoteDoc.topicid}`,
      choice: newVoteDoc.choice,
      createdAt: dayjs(newVoteDoc.createdAt).toString(),
    }
  });
  
  return {
    votes,
  }
})