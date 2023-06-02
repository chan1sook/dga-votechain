import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { model, Schema } from "mongoose";

dayjs.extend(utc);
dayjs.extend(timezone);

const schema = new Schema<VoterAllowModelData>({
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

export default model<VoterAllowModelData>('topic-voter-allow', schema);