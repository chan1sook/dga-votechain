import dayjs from "dayjs"
import { isTopicExpired } from "~~/src/utils/topic";

import TopicModel from "~~/src/models/topic"
import VoteModel from "~~/src/models/vote"

export default defineEventHandler(async (event) => {  
  const topicDoc = await TopicModel.findById(event.context.params?.id);
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }

  if(topicDoc.status !== "approved" || !isTopicExpired(topicDoc)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not expired or not approved",
    });
  }

  const allVotes = await VoteModel.find({ topicid: topicDoc._id });
  const voteRecords : Array<TopicVoteCountRecord> = [];

  for(const vote of allVotes) {
    const target = voteRecords.find((ele) => ele.choice === vote.choice);
    if(target) {
      target.count += 1;
    } else {
      voteRecords.push({ choice: vote.choice, count: 1 })
    }
  }
  allVotes.reduce((prev, current) => {
    return prev;
  }, voteRecords);
  
  const voteResult : TopicVoteCountResponse = {
    _id: `${topicDoc._id}`,
    status: topicDoc.status,
    name: topicDoc.name,
    description: topicDoc.description,
    choices: topicDoc.choices,
    voteStartAt: dayjs(topicDoc.voteStartAt).toString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toString(),
    createdAt: dayjs(topicDoc.createdAt).toString(),
    updatedAt: dayjs(topicDoc.updatedAt).toString(),
    votes: voteRecords,
  }
  return {
    voteResult,
  }
})