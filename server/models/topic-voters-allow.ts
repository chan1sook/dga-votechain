import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { FilterQuery, model, Schema, Types } from "mongoose";

dayjs.extend(utc);
dayjs.extend(timezone);

const schema = new Schema<TopicVoterAllowModelData, TopicVoterAllowModel>({
  topicid: {
    type: Schema.Types.ObjectId,
    ref: "topic",
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: "dga-user",
  },
  remainVotes: {
    type: Number,
    default: 0,
  },
  totalVotes: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

schema.statics.getVoterAllowForTopicsFilters = function(userid: Types.ObjectId, pagesize?: number, startTopicid?: string) {
  const query : FilterQuery<TopicVoterAllowModelData> = {
    userid: userid,
  };

  if(startTopicid) {
    query.topicid = { $lt: new Types.ObjectId(startTopicid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({topicId: -1 });
}
export default model<TopicVoterAllowModelData, TopicVoterAllowModel>('topic-voter-allow', schema);