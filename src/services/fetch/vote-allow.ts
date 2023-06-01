import { Types } from "mongoose"
import TopicVoterAllowModel from "~~/server/models/topic-voters-allow"

export function getTopicVoterAllowByTopicId(topicid: Types.ObjectId) {
  return TopicVoterAllowModel.find({
    topicid
  });
}