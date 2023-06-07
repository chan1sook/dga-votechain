import { FilterQuery, Types } from "mongoose"
import VoterAllowModel from "~/src/models/voters-allow"

export function getVoterAllowByTopicId(topicid: Types.ObjectId) {
  return VoterAllowModel.find({
    topicid
  });
}

export function getVoterAllowByUserId(userid: Types.ObjectId, pagesize?: number, startTopicid?: string) {
  const query : FilterQuery<VoterAllowModelData> = {
    userid: userid,
  };

  if(startTopicid) {
    query.topicid = { $lt: new Types.ObjectId(startTopicid) }
  }
  
  
  return VoterAllowModel.find(query).limit(pagesize || 50).sort({topicId: -1 });
}