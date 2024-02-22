import { model, Schema } from "mongoose";

const schema = new Schema<VoterAllowModelData>(
  {
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
    },
  },
  { timestamps: true }
);

schema.index({ userid: 1, topicid: 1 });

export default model<VoterAllowModelData>("topic-voter-allow", schema);
