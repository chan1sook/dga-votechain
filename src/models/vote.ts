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
    tx: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<VoteModelData>("vote", schema);
