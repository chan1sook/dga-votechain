import dayjs from "dayjs";
import TopicModel from "~~/src/models/topic"
import VoteModel from "~~/src/models/vote"
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { isTopicExpired } from "~~/src/utils/topic";

export default defineEventHandler(async (event) => {
  const { withVote } : { withVote?: string } = getQuery(event);

  const topicDoc = await TopicModel.findById(event.context.params?.id);
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }

  const topic: TopicResponseData = {
    _id: `${topicDoc._id}`,
    status: topicDoc.status,
    name: topicDoc.name,
    description: topicDoc.description,
    choices: topicDoc.choices,
    voteStartAt: dayjs(topicDoc.voteStartAt).toString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toString(),
    createdAt: dayjs(topicDoc.createdAt).toString(),
    updatedAt: dayjs(topicDoc.updatedAt).toString(),
  }

  let yourVote : VoteResponseData | undefined;

  if(withVote && !isTopicExpired(topicDoc)) {
    const userData = event.context.userData;
    if(userData && checkPermissionNeeds(userData.permissions, "vote-topic")) {
      const voteDoc = await VoteModel.findOne({ userid: userData.userid, topicid: topicDoc._id });
      if(voteDoc) {
        yourVote = {
          _id: `${voteDoc._id}`,
          userid: userData.userid,
          topicid: `${topic._id}`,
          choice: voteDoc.choice,
          createdAt: dayjs(voteDoc.createdAt).toString()
        };
      }
    }
  }
  
  return {
    topic,
    yourVote,
  }
})