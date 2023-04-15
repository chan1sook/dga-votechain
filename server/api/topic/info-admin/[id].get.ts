import dayjs from "dayjs";
import { Types } from "mongoose";
import TopicModel from "~~/server/models/topic"
import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  const isAdminMode = userData && (userData.roleMode === "admin" || userData.roleMode === "developer");
  if(!isAdminMode) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const topicDoc = await TopicModel.findById(event.context.params?.id).populate("createdBy updatedBy");
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }

  const topic : TopicResponseData = {
    _id: topicDoc._id.toString(),
    status: topicDoc.status,
    name: topicDoc.name,
    description: topicDoc.description,
    multipleVotes: topicDoc.multipleVotes,
    choices: topicDoc.choices,
    voteStartAt: dayjs(topicDoc.voteStartAt).toISOString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toISOString(),
    createdAt: dayjs(topicDoc.createdAt).toISOString(),
    updatedAt: dayjs(topicDoc.updatedAt).toISOString(),
    createdBy: topicDoc.createdBy && !(topicDoc.createdBy instanceof Types.ObjectId) ? {
      _id: topicDoc.createdBy._id,
      firstName: topicDoc.createdBy.firstName,
      lastName: topicDoc.createdBy.lastName,
      email: topicDoc.createdBy.email,
    } : undefined,
    updatedBy: topicDoc.updatedBy && !(topicDoc.updatedBy instanceof Types.ObjectId) ? {
      _id: topicDoc.updatedBy._id,
      firstName: topicDoc.updatedBy.firstName,
      lastName: topicDoc.updatedBy.lastName,
      email: topicDoc.updatedBy.email,
    } : undefined,
    publicVote: topicDoc.publicVote,
    showScores: topicDoc.showScores,
    showVotersChoicesPublic: topicDoc.showVotersChoicesPublic,
    recoredToBlockchain: topicDoc.recoredToBlockchain,
    notifyVoter: topicDoc.notifyVoter,
  };

  const voterAllowDocs : Array<TopicVoterAllowDataPopulated> = await TopicVoterAllowsModel.find({
    topicid: topicDoc._id,
  }).populate("userid");
  
  const voterAllows : Array<TopicVoterAllowFormDataWithHint> = voterAllowDocs.map((ele) => {
    return ele.userid ? {
      userid: ele.userid._id.toString(),
      firstName: ele.userid.firstName,
      lastName: ele.userid.lastName,
      email: ele.userid.email,
      totalVotes: ele.totalVotes,
      remainVotes: ele.remainVotes
    } : {
      userid: `${ele.userid}`,
      totalVotes: ele.totalVotes,
      remainVotes: ele.remainVotes
    }
  })
  
  return {
    topic,
    voterAllows
  }
})