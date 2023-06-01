import { FilterQuery, Types } from "mongoose"
import VoteModel from "~/src/models/vote"

export function getVotesByTopicId(topicid: Types.ObjectId) {
  return VoteModel.find({
    topicid
  });
}

export function getLastestVotes(pagesize?: number, startid?: string, filterKeyword?: string) {
  const query : FilterQuery<VoteModelData> = {
    $and: []
  };

  if(startid) {
    query.$and!.push({
      _id: { $lt: new Types.ObjectId(startid) }
    })
  }

  if(filterKeyword) {
    query.$and!.push({ $or: [
      { _id: new Types.ObjectId(filterKeyword) },
      { userid: filterKeyword },
      { topicid: new Types.ObjectId(filterKeyword) }
    ]});
  }
  
  if(query.$and?.length === 0) {
    delete query.$and;
  }
  
  return VoteModel.find(query).limit(pagesize || 50).sort({ _id:-1 });
}