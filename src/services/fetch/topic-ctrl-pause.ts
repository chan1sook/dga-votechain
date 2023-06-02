import { Types } from "mongoose";
import TopicCtrlPauseModel from "~/src/models/topic-ctrl-pause"

export function getTopicCtrlPauseListByTopicId(topicid: Types.ObjectId) {
  return TopicCtrlPauseModel.find({ topicid: topicid });
}

export function getTopicCtrlPauseListByTopicIds(topicids: Types.ObjectId[]) {
  return TopicCtrlPauseModel.find({ topicid: { $in: topicids } });
}

export async function isTopicPause(topicid: Types.ObjectId) {
  const doc = await TopicCtrlPauseModel.findOne({
    topicid: topicid,
    resumeAt: { $exists: false }
  });

  return doc !== null;
}