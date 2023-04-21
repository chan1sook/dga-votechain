import dayjs from "dayjs";
import { Types } from "mongoose";

import TopicModel from "~~/server/models/topic"
import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"
import TopicPauseModel from "~~/server/models/topic-pause"

export default defineEventHandler(async (event) => {
  const { filter } = getQuery(event);
  let topicsData: Array<TopicDataWithId> = [];
  let filterParams : TopicFilterParams = { type: "all" };
  if(typeof filter === "string") {
    try {
      filterParams = JSON.parse(filter)
    } catch(err) {
      console.error(err);
    }
  }
  
  const userData = event.context.userData;
  const topicVoterAllowsDocs = userData ? await TopicVoterAllowsModel.getVoterAllowForTopicsFilters(userData._id, filterParams?.pagesize, filterParams?.startid) : [];
  
  if(!userData || userData.roleMode === "guest") {
    topicsData = await TopicModel.getLastestPublicVoteTopics(filterParams);
  } else if(userData.roleMode === "voter") {
    topicsData = await TopicModel.getLastestPublicVoteWithIdsTopics(topicVoterAllowsDocs.map((ele) => ele._id), filterParams);
  } else {
    topicsData = await TopicModel.getLastestAvailableTopics(filterParams);
  }

  const topicPauseDocs = await TopicPauseModel.find({ topicid: { $in: topicsData.map((ele) => ele._id)} });
  
  const topics = topicsData.map<TopicResponseDataExtended>((topicData, i) => {
    const topicAllowDoc = topicVoterAllowsDocs.find((voterAllow) => `${voterAllow.topicid._id}` === `${topicData._id}`);
    const topicPauseArr = topicPauseDocs.filter((ele) => `${ele.topicid._id}` === `${topicData._id}`);

    return {
      _id: topicData._id.toString(),
      status: topicData.status,
      name: topicData.name,
      description: topicData.description,
      multipleVotes: topicData.multipleVotes,
      choices: topicData.choices,
      createdBy: topicData.createdBy && !(topicData.createdBy instanceof Types.ObjectId) ? {
        _id: topicData.createdBy._id,
        firstName: topicData.createdBy.firstName,
        lastName: topicData.createdBy.lastName,
        email: topicData.createdBy.email,
      } : undefined,
      updatedBy: topicData.updatedBy && !(topicData.updatedBy instanceof Types.ObjectId) ? {
        _id: topicData.updatedBy._id,
        firstName: topicData.updatedBy.firstName,
        lastName: topicData.updatedBy.lastName,
        email: topicData.updatedBy.email,
      } : undefined,
      createdAt: dayjs(topicData.createdAt).toISOString(),
      updatedAt: dayjs(topicData.updatedAt).toISOString(),
      voteStartAt: dayjs(topicData.voteStartAt).toISOString(),
      voteExpiredAt: dayjs(topicData.voteExpiredAt).toISOString(),
      publicVote: topicData.publicVote,
      showScores: topicData.showScores,
      showVotersChoicesPublic: topicData.showVotersChoicesPublic,
      recoredToBlockchain: topicData.recoredToBlockchain,
      voterAllow: topicAllowDoc ? {
        topicid: topicData._id.toString(),
        userid: topicAllowDoc.userid.toString(),
        totalVotes: topicAllowDoc.totalVotes,
        remainVotes: topicAllowDoc.remainVotes,
      } : undefined,
      pauseData: topicPauseArr.map((ele) => {
        return {
          topicid: topicData._id.toString(),
          pauseAt: dayjs(ele.pauseAt).toISOString(),
          resumeAt: ele.resumeAt ? dayjs(ele.resumeAt).toISOString() : undefined
        }
      })
    }
  })
  
  return {
    topics,
  }
})