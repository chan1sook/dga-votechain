import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { model, Schema } from "mongoose";

dayjs.extend(utc);
dayjs.extend(timezone);

const schema = new Schema<TopicCtrlPauseModelData>({
  topicid: {
    type: Schema.Types.ObjectId,
    ref: "topic"
  },
  pauseAt: {
    type: Date,
    default: Date.now
  },
  cause: {
    type: String,
    default: ""
  },
  resumeAt: {
    type: Date,
  }
});

export default model<TopicCtrlPauseModelData>('topic-pause', schema);