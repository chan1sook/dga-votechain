import dayjs from "dayjs";
import TopicModel from "~~/server/models/topic"
import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"
import TopicPauseData from "~~/server/models/topic-pause"
import VoteModel from "~~/server/models/vote"

export default defineEventHandler(async (event) => {
  const topicDoc : TopicDataWithIdPopulated | null = await TopicModel.findById(event.context.params?.id).populate("createdBy updatedBy");
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }
  
  const userData = event.context.userData;

  let voterAllow;
  let votes : Array<VoteResponseData> = [];
  let adminVoterAllows : Array<TopicVoterAllowResponseData> | undefined;

  const topicPauseData = await TopicPauseData.find({
    topicid: topicDoc._id,
  });

  if(userData) {
    const [_voterAllow, _votes] = await Promise.all([
      TopicVoterAllowsModel.findOne({
        topicid: topicDoc._id,
        userid: userData._id
      }),
      VoteModel.find({ topicid: topicDoc._id, userid: userData._id })
    ])

    if(_voterAllow) {
      voterAllow = {
        userid: userData._id.toString(),
        topicid: topicDoc._id.toString(),
        remainVotes: _voterAllow.remainVotes,
        totalVotes: _voterAllow.totalVotes,
      }
    }
    
    if(userData.roleMode === "voter" && !_voterAllow) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }
    
    votes = _votes.map((vote) => {
      return {
        _id: `${vote._id}`,
        userid: `${vote.userid}`,
        topicid: `${vote.topicid}`,
        choice: vote.choice,
        createdAt: dayjs(vote.createdAt).toISOString(),
        tx: vote.tx,
      }
    })

    if(userData.roleMode === "admin" || userData.roleMode === "developer") {
      const voterAllowsDocs = await TopicVoterAllowsModel.find({
        topicid: topicDoc._id,
      })
      
      adminVoterAllows = voterAllowsDocs.map((ele) => {
        return ele.userid ? {
          topicid: topicDoc._id.toString(),
          userid: ele.userid._id.toString(),
          totalVotes: ele.totalVotes,
          remainVotes: ele.remainVotes
        } : {
          topicid: topicDoc._id.toString(),
          userid: `${ele.userid}`,
          totalVotes: ele.totalVotes,
          remainVotes: ele.remainVotes
        }
      })
    }
  }
  
  const topic : TopicResponseDataExtended = {
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
    voterAllow,
    pauseData: topicPauseData.map((ele) => {
      return {
        topicid: topicDoc._id.toString(),
        pauseAt: dayjs(ele.pauseAt).toISOString(),
        resumeAt: ele.resumeAt ? dayjs(ele.resumeAt).toISOString() : undefined,
      }
    })
  };

  return {
    topic,
    votes,
    adminVoterAllows
  };
})