import { model, Schema } from "mongoose";

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