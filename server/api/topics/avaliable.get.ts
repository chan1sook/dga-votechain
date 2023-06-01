import dayjs from "dayjs";

import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"
import TopicPauseModel from "~~/server/models/topic-pause"
import { getLastestAdminTopics, getLastestFinishedPublicVoteTopics, getLastestVoterTopicsWithIds } from "~/src/services/fetch/topics";

export default defineEventHandler(async (event) => {
  const { filter } = getQuery(event);
  let topicsData: TopicDataWithIdPopulated[] = [];
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
  
  let filterIds;
  if(!userData || userData.roleMode === "guest") {
    topicsData = await getLastestFinishedPublicVoteTopics(filterParams).populate("createdBy");
  } else if(userData.roleMode === "voter") {
    filterIds = topicVoterAllowsDocs.map((ele) => ele.topicid).filter((ele, i, arr) => arr.indexOf(ele) === i);
    topicsData = await getLastestVoterTopicsWithIds(filterIds, filterParams).populate("createdBy");
  } else {
    topicsData = await getLastestAdminTopics(userData._id, filterParams).populate("createdBy");
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
      createdBy: {
        _id: topicData.createdBy._id.toString(),
        firstName: topicData.createdBy.firstName,
        lastName: topicData.createdBy.lastName,
        email: topicData.createdBy.email,
      },
      updatedBy: topicData.updatedBy.toString(),
      admin: topicData.admin.toString(),
      coadmins: topicData.coadmins.map((ele) => {
        return ele.toString()
      }),
      createdAt: dayjs(topicData.createdAt).toISOString(),
      updatedAt: dayjs(topicData.updatedAt).toISOString(),
      durationMode: topicData.durationMode,
      voteStartAt: dayjs(topicData.voteStartAt).toISOString(),
      voteExpiredAt: dayjs(topicData.voteExpiredAt).toISOString(),
      publicVote: topicData.publicVote,
      recoredToBlockchain: topicData.recoredToBlockchain,
      voterAllow: topicAllowDoc ? {
        topicid: topicData._id.toString(),
        userid: `${topicAllowDoc.userid}`,
        totalVotes: topicAllowDoc.totalVotes,
        remainVotes: topicAllowDoc.remainVotes,
      } : undefined,
      pauseData: topicPauseArr.map((ele) => {
        return {
          topicid: topicData._id.toString(),
          pauseAt: dayjs(ele.pauseAt).toISOString(),
          resumeAt: ele.resumeAt ? dayjs(ele.resumeAt).toISOString() : undefined
        }
      }),
      notifyVoter: topicData.notifyVoter,
      defaultVotes: topicData.defaultVotes,
    }
  })
  
  return {
    topics,
  }
})