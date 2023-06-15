import dayjs from "dayjs";
import UserModel from "~/src/models/user"
import TopicModel from "~/src/models/topic"
import TopicVoterAllowsModel from "~/src/models/voters-allow"
import { getTopicCtrlPauseListByTopicId } from "~/src/services/fetch/topic-ctrl-pause";
import { isAdminRole } from "~/src/services/validations/role";
import { getAnonymousVotesByTopicId } from "~/src/services/fetch/vote";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  const isAdminMode = userData && isAdminRole(userData.roleMode);
  if(!isAdminMode) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const topicDoc : TopicModelDataWithIdPopulated | null = await TopicModel.findById(event.context.params?.id).populate("createdBy");
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
    distinctVotes: topicDoc.distinctVotes,
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
    anonymousVotes: topicDoc.anonymousVotes,
    defaultVotes: topicDoc.defaultVotes,
    recoredToBlockchain: topicDoc.recoredToBlockchain,
    notifyVoter: topicDoc.notifyVoter,
  };

  const [voterAllowDocs, coadminDocs, pauseDataDocs, anonVotes] = await Promise.all([
    TopicVoterAllowsModel.find({ topicid: topicDoc._id }).populate("userid"),
    UserModel.find({ _id: { $in: topicDoc.coadmins.map((ele) => ele._id) }}),
    getTopicCtrlPauseListByTopicId(topicDoc._id),
    getAnonymousVotesByTopicId(topicDoc._id)
  ]);

  const anonyomusVotes : AnonymousVoteResponseData[] = [];
  for(const vote of anonVotes) {
    const target = anonyomusVotes.find((ele) => ele.groupid === vote.groupid);
    if(target) {
      target.count += 1;
    } else {
      anonyomusVotes.push({
        groupid: vote.groupid,
        count: 1
      });
    }
  }
  
  if(!topic.publicVote) {
    let isAllowed = false;

    // check if is admin
    if(topicDoc.admin.toString() === userData._id.toString()) {
      isAllowed = true;
    }

    // check if is coadmins
    if(topicDoc.coadmins.find((ele) => ele.toString() === userData._id.toString())) {
      isAllowed = true;
    }
    
    if(!isAllowed) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }
  }
  
  const voterAllows : VoterAllowVoteData[] = voterAllowDocs.map((ele) => {
    return ele.userid ? {
      userid: (ele.userid as unknown as UserModelDataWithId)._id.toString(),
      firstName: (ele.userid as unknown as UserModelDataWithId).firstName,
      lastName: (ele.userid as unknown as UserModelDataWithId).lastName,
      email: (ele.userid as unknown as UserModelDataWithId).email,
      totalVotes: ele.totalVotes
    } : {
      userid: `${ele.userid}`,
      totalVotes: ele.totalVotes
    }
  });

  const rawVoterAllows: RawVoterAllowVoteData[] = voterAllowDocs.map((ele) => {
    return {
      _id: ele._id.toString(),
      remainVotes: ele.remainVotes,
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

  const pauseData : TopicCtrlPauseResponseData[] = pauseDataDocs.map((ele) => {
    return {
      topicid: ele.topicid.toString(),
      pauseAt: dayjs(ele.pauseAt).toString(),
      cause: ele.cause,
      resumeAt: ele.resumeAt ? dayjs(ele.resumeAt).toString() : undefined,
    }
  });

  return {
    topic,
    voterAllows,
    rawVoterAllows,
    coadmins,
    anonyomusVotes,
    pauseData
  }
})