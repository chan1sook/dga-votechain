import dayjs from "dayjs";
import UserModel from "~~/server/models/user"
import TopicModel from "~~/server/models/topic"
import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"
import TopicPauseModel from "~~/server/models/topic-pause"
import { Types } from "mongoose";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  const isAdminMode = userData && (userData.roleMode === "admin" || userData.roleMode === "developer");
  if(!isAdminMode) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const topicDoc : TopicDataWithIdPopulated | null = await TopicModel.findById(event.context.params?.id).populate("createdBy");
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }

  const topic : TopicResponseData & { notifyVoter: boolean } = {
    _id: topicDoc._id.toString(),
    status: topicDoc.status,
    name: topicDoc.name,
    description: topicDoc.description,
    multipleVotes: topicDoc.multipleVotes,
    choices: topicDoc.choices,
    durationMode: topicDoc.durationMode,
    voteStartAt: dayjs(topicDoc.voteStartAt).toISOString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toISOString(),
    createdAt: dayjs(topicDoc.createdAt).toISOString(),
    updatedAt: dayjs(topicDoc.updatedAt).toISOString(),
    createdBy: {
      _id: topicDoc.createdBy._id.toString(),
      firstName: topicDoc.createdBy.firstName,
      lastName: topicDoc.createdBy.lastName,
      email: topicDoc.createdBy.email,
    },
    updatedBy: topicDoc.updatedBy.toString(),
    admin: topicDoc.admin.toString(),
    coadmins: topicDoc.coadmins.map((ele) => {
      return ele.toString()
    }),
    publicVote: topicDoc.publicVote,
    showScores: topicDoc.showScores,
    showVotersChoicesPublic: topicDoc.showVotersChoicesPublic,
    recoredToBlockchain: topicDoc.recoredToBlockchain,
    notifyVoter: topicDoc.notifyVoter,
  };

  const [voterAllowDocs, coadminDocs, pauseDataDocs] : [Array<TopicVoterAllowDataPopulated>, Array<UserData & { _id: Types.ObjectId}>, Array<TopicPauseData>] = await Promise.all([
    TopicVoterAllowsModel.find({ topicid: topicDoc._id }).populate("userid"),
    UserModel.find({ _id: { $in: topicDoc.coadmins.map((ele) => ele._id) }}),
    TopicPauseModel.find({ topicid: topicDoc._id }),
  ]);
  
  const voterAllows : Array<TopicVoterAllowFormData> = voterAllowDocs.map((ele) => {
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
  
  const coadmins : Array<CoadminFormData> = coadminDocs.map((ele) => {
    return {
      userid: ele._id.toString(),
      email: ele.email,
      firstName: ele.firstName,
      lastName: ele.lastName,
    }
  })

  const pauseData : Array<TopicPauseResponseData> = pauseDataDocs.map((ele) => {
    return {
      topicid: ele.topicid.toString(),
      pauseAt: dayjs(ele.pauseAt).toString(),
      resumeAt: ele.resumeAt ? dayjs(ele.resumeAt).toString() : undefined,
    }
  });

  return {
    topic,
    voterAllows,
    coadmins,
    pauseData
  }
})