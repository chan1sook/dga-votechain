import { model, Schema } from "mongoose";

const schema = new Schema<VoteModelData>(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "dga-user",
    },
    topicid: {
      type: Schema.Types.ObjectId,
      ref: "topic",
      required: true,
    },
    groupid: {
      type: String,
      default: "",
    },
    choice: {
      type: String,
    },
    txOptional: {
      type: Boolean,
      default: false,
    },
    tx: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

schema.index({ _id: 1, userid: 1, topicid: 1 });

export default model<VoteModelData>("vote", schema);
