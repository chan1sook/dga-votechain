import { Types } from "mongoose";
import dayjs from "dayjs";

import TopicModel from "~~/src/models/topic"
import VoteModel from "~~/src/models/vote"
import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const { type, pagesize, startid } : TopicQueryParams = getQuery(event);
  
  let topicsData: Array<TopicData> = [];
  let voteIds: Array<Types.ObjectId> = [];

  if(type === "notvoted" || type === "voted") {
    const userData = event.context.userData;

    if(!userData || !checkPermissionNeeds(userData.permissions, "vote-topic")) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }

    const votes = await VoteModel.getLastestVotesByUserid(userData.userid, pagesize, startid);
    voteIds = votes.reduce((prev, current) => {
      if(current.topicid) {
        prev.push(current.topicid);
      }
      return prev;
    }, voteIds);
  }
  
  switch(type) {
    case "available":
      topicsData = await TopicModel.getLastestAvalaibleTopics(pagesize, startid);
      break;
    case "waiting":
      topicsData = await TopicModel.getLastestWaitingTopics(pagesize, startid);
      break;
    case "active":
      topicsData = await TopicModel.getLastestActiveTopics(pagesize, startid);
      break;
    case "notvoted":
      topicsData = await TopicModel.getLastestActiveTopics(pagesize, startid, voteIds);
      break;
    case "voted":
      topicsData = await TopicModel.getSelectedTopics(voteIds);
      break;
    case "finished":
      topicsData = await TopicModel.getLastestFinishedTopics(pagesize, startid);
      break;
    case "pending":
      topicsData = await TopicModel.getLastestPendingTopics(pagesize, startid);
      break;
    case "all":
      topicsData = await TopicModel.find(startid ? { _id: { $lt: startid }} : {}).limit(pagesize || 50).sort({_id: -1});
      break;
    default:
      topicsData = await TopicModel.getLastestAvalaibleTopics(pagesize, startid);
      break;
  }

  const topics = topicsData.map<TopicResponseData>((topicData, i) => {
    return {
      _id: `${topicData._id}`,
      status: topicData.status,
      name: topicData.name,
      description: topicData.description,
      choices: topicData.choices,
      createdAt: dayjs(topicData.createdAt).toISOString(),
      updatedAt: dayjs(topicData.updatedAt).toISOString(),
      voteStartAt: dayjs(topicData.voteStartAt).toISOString(),
      voteExpiredAt: dayjs(topicData.voteExpiredAt).toISOString(),
    }
  })
  
  return {
    topics,
  }
})