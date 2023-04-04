import dayjs from "dayjs";

import TopicModel from "~~/server/models/topic"
import { checkPermissionSelections } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const { type, filter } : TopicQueryParams = getQuery(event);
  
  const userData = event.context.userData;

  let topicsData: Array<TopicData> = [];
  const filter2 = JSON.parse(filter || "{}") as TopicFilterParams;
  switch(type) {
    case "active":  
      if(!userData || !checkPermissionSelections(userData.permissions, "vote-topic")) {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden",
        });
      }
      topicsData = await TopicModel.getLastestActiveTopics(userData, filter2);
      break;
    case "available":
      topicsData = await TopicModel.getLastestAvailableTopics(filter2, userData && checkPermissionSelections(userData.permissions, "vote-topic") ? true : false);
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
      createdByName: topicData.createdByName,
      updatedAt: dayjs(topicData.updatedAt).toISOString(),
      updatedByName: topicData.updatedByName,
      voteStartAt: dayjs(topicData.voteStartAt).toISOString(),
      voteExpiredAt: dayjs(topicData.voteExpiredAt).toISOString(),
      pauseDuration: topicData.pauseDuration,
      publicVote: topicData.publicVote,
      showVotersScore: topicData.showVotersScore,
      showVotersChoicesPublic: topicData.showVotersChoicesPublic,
      notifyVoter: topicData.notifyVoter,
      voterAllows: topicData.voterAllows,
    }
  })
  
  return {
    topics,
  }
})