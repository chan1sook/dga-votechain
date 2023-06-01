import dayjs from "dayjs";
import UserModel from "~/src/models/user"
import TopicModel from "~/src/models/topic"
import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"
import TopicPauseModel from "~~/server/models/topic-pause"

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
    recoredToBlockchain: topicDoc.recoredToBlockchain,
    notifyVoter: topicDoc.notifyVoter,
  };

  const [voterAllowDocs, coadminDocs, pauseDataDocs] = await Promise.all([
    TopicVoterAllowsModel.find({ topicid: topicDoc._id }).populate("userid"),
    UserModel.find({ _id: { $in: topicDoc.coadmins.map((ele) => ele._id) }}),
    TopicPauseModel.find({ topicid: topicDoc._id }),
  ]);
  
  const voterAllows : TopicVoterAllowFormData[] = voterAllowDocs.map((ele) => {
    return ele.userid ? {
      userid: (ele.userid as unknown as UserModelDataWithId)._id.toString(),
      firstName: (ele.userid as unknown as UserModelDataWithId).firstName,
      lastName: (ele.userid as unknown as UserModelDataWithId).lastName,
      email: (ele.userid as unknown as UserModelDataWithId).email,
      totalVotes: ele.totalVotes,
      remainVotes: ele.remainVotes
    } : {
      userid: `${ele.userid}`,
      totalVotes: ele.totalVotes,
      remainVotes: ele.remainVotes
    }
  })
  
  const coadmins : CoadminFormData[] = coadminDocs.map((ele) => {
    return {
      userid: ele._id.toString(),
      email: ele.email,
      firstName: ele.firstName,
      lastName: ele.lastName,
    }
  })

  const pauseData : TopicPauseResponseData[] = pauseDataDocs.map((ele) => {
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