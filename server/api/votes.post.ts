import dayjs from "dayjs";

import TopicModel from "~~/server/models/topic"
import TopicVoterAllowModel from "~~/server/models/topic-voters-allow"
import VoteModel from "~~/server/models/vote"

import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { getEventEmitter } from "../global-emitter";
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionNeeds(userData.permissions, "vote-topic")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const voteFormData : VoteFormData = await readBody(event);

  const topicDoc = await TopicModel.findById(voteFormData.topicid);
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }
  
  const voterAllowData = await TopicVoterAllowModel.findOne({
    userid: userData._id,
    topicid: topicDoc._id,
  });

  if(!voterAllowData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const remainVotes = voterAllowData.remainVotes;
  if(remainVotes <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Can't vote anymore",
    });
  }

  if(topicDoc.multipleVotes) {
    if(voteFormData.votes.length > voterAllowData.remainVotes) {
      voteFormData.votes = voteFormData.votes.slice(0, voterAllowData.remainVotes);
    }
    voterAllowData.remainVotes -= voteFormData.votes.length;
  } else {
    voteFormData.votes = voteFormData.votes.slice(0, 1);
    voterAllowData.remainVotes = 0;
  }


  const today = new Date();
  const voteDatas : Array<VoteData> = voteFormData.votes.map((choice) => {
    return {
      userid: userData._id,
      topicid: topicDoc._id,
      choice: choice,
      createdAt: today,
      updatedAt: today,
    }
  });

  const [docs] = await Promise.all([
    VoteModel.insertMany(voteDatas),
    voterAllowData.save(),
  ]);
  
  const votes : Array<VoteResponseData> = docs.map((newVoteDoc) => {
    return {
      _id: `${newVoteDoc._id}`,
      userid: `${newVoteDoc.userid}`,
      topicid: `${newVoteDoc.topicid}`,
      choice: newVoteDoc.choice,
      createdAt: dayjs(newVoteDoc.createdAt).toString(),
    }
  });

  await dbSession.commitTransaction();
  await dbSession.endSession();

  const eventEmitter = getEventEmitter();

  eventEmitter.emit("voted", {
    id: topicDoc._id.toString(),
    votes,
  });
  
  return {
    votes,
  }
})