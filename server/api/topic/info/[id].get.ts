import dayjs from "dayjs";
import TopicModel from "~/src/models/topic"
import TopicVoterAllowsModel from "~/src/models/voters-allow"
import TopicPauseData from "~/src/models/topic-ctrl-pause"
import { getVotesByTopicIdAndUserId } from "~/src/services/fetch/vote";
import { isBannedUser } from "~/src/services/validations/user";
import { isAnonymousTopic, isCanVote, isUserInMatchInternalTopic } from "~/src/services/validations/topic";

export default defineEventHandler(async (event) => {
  const topicDoc : TopicModelDataWithIdPopulated | null = await TopicModel.findById(event.context.params?.id).populate("createdBy");
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }
  
  const userData = event.context.userData;

  let voterAllow: VoterAllowResponseData | undefined;
  let votes : VoteResponseData[] = [];

  const topicPauseData = await TopicPauseData.find({
    topicid: topicDoc._id,
  });

  if(userData && !isBannedUser(userData)) {
    const [_voterAllow, _votes] = await Promise.all([
      TopicVoterAllowsModel.findOne({
        topicid: topicDoc._id,
        userid: userData._id
      }),
      getVotesByTopicIdAndUserId(topicDoc._id, userData._id),
    ])

    if(_voterAllow) {
      voterAllow = {
        userid: userData._id.toString(),
        topicid: topicDoc._id.toString(),
        remainVotes: _voterAllow.remainVotes,
        totalVotes: _voterAllow.totalVotes,
      }
    }
    
    votes = _votes.map((vote) => {
      return {
        _id: `${vote._id}`,
        userid: `${vote.userid}`,
        topicid: `${vote.topicid}`,
        groupid: vote.groupid,
        choice: vote.choice,
        createdAt: dayjs(vote.createdAt).toISOString(),
        tx: vote.tx,
      }
    })
  }

  if(topicDoc.type !== "public") {
    let isAllowed = false;

    if(userData) {
      if(voterAllow && voterAllow.userid) {
        isAllowed = true;
      }

      if(topicDoc.type === "internal" && userData && isUserInMatchInternalTopic(topicDoc.internalFilter, userData)) {
        isAllowed = true
      }

      // check if is admin
      if(topicDoc.admin.toString() === userData._id.toString()) {
        isAllowed = true;
      }

      // check if is coadmins
      if(topicDoc.coadmins.find((ele) => ele.toString() === userData._id.toString())) {
        isAllowed = true;
      }
    }

    if(!isAllowed) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }
  }
  
  const topic : TopicResponseData = {
    _id: topicDoc._id.toString(),
    status: topicDoc.status,
    name: topicDoc.name,
    description: topicDoc.description,
    type: topicDoc.type,
    internalFilter: topicDoc.internalFilter,
    multipleVotes: topicDoc.multipleVotes,
    distinctVotes: topicDoc.distinctVotes,
    choices: topicDoc.choices,
    durationMode: topicDoc.durationMode,
    voteStartAt: dayjs(topicDoc.voteStartAt).toISOString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toISOString(),
    createdAt: dayjs(topicDoc.createdAt).toISOString(),
    updatedAt: dayjs(topicDoc.updatedAt).toISOString(),
    createdBy: topicDoc.showCreator ? {
      _id: topicDoc.createdBy._id.toString(),
      firstName: topicDoc.createdBy.firstName,
      lastName: topicDoc.createdBy.lastName,
      email: topicDoc.createdBy.email,
    } : undefined,
    updatedBy: topicDoc.updatedBy.toString(),
    admin: topicDoc.admin.toString(),
    coadmins: topicDoc.coadmins.map((ele) => {
      return ele.toString()
    }),
    anonymousVotes: topicDoc.anonymousVotes,
    showCreator: topicDoc.showCreator,
    recoredToBlockchain: topicDoc.recoredToBlockchain,
    defaultVotes: topicDoc.defaultVotes,
    notifyVoter: topicDoc.notifyVoter
  };
  
  const quota = voterAllow ? voterAllow.totalVotes : topicDoc.defaultVotes;
  const voted = votes.length;

  const canVote = isCanVote(userData, topicDoc, voterAllow);

  const pauseData : TopicCtrlPauseResponseData[] = topicPauseData.map((ele) => {
    return {
      topicid: ele.topicid.toString(),
      pauseAt: dayjs(ele.pauseAt).toString(),
      cause: ele.cause,
      resumeAt: ele.resumeAt ? dayjs(ele.resumeAt).toString() : undefined,
    }
  });

  return {
    topic,
    votes,
    canVote,
    quota,
    voted,
    pauseData,
  };
})