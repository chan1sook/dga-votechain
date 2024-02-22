import { model, Schema } from "mongoose";

const schema = new Schema<TopicCtrlPauseModelData>({
  topicid: {
    type: Schema.Types.ObjectId,
    ref: "topic",
  },
  pauseAt: {
    type: Date,
    default: Date.now,
  },
  cause: {
    type: String,
    default: "",
  },
  resumeAt: {
    type: Date,
  },
});

schema.index({
  topicid: 1,
  resumeAt: 1,
});

export default model<TopicCtrlPauseModelData>("topic-pause", schema);
