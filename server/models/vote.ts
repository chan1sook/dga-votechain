import { FilterQuery, model, Schema, Types } from "mongoose";
import { getNtpTime } from "~~/server/ntp";

const schema = new Schema<VoteData, VoteModel>({
  userid: {
    type: String,
    required: true,
  },
  topicid: {
    type: Schema.Types.ObjectId,
    ref: "topic",
    required: true,
  },
  choice: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
  },
});

schema.pre('save', async function () {
  const today = await getNtpTime();
  if (!this.createdAt) {
    this.createdAt = today;
  }
});

schema.static("getLastestVotes", function getLastestVotes(pagesize?: number, startid?: string, filterKeyword?: string) {
  const query : FilterQuery<VoteData> = {
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
  
  return this.find(query).limit(pagesize || 50).sort({ _id:-1 });
});

schema.static("getLastestVotesByUserid", function getLastestVotesByUserid(userid: DigitalIDUserId, pagesize?: number, startid?: string) {
  const query : FilterQuery<TopicData> = {
    userid,
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({ topicid: -1, _id:-1 });
});

export default model<VoteData, VoteModel>('vote', schema);