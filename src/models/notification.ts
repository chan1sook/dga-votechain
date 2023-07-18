import { model, Schema } from "mongoose";

const schema = new Schema<NotificationModelData>(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "dga-user",
    },
    group: {
      type: String,
      required: true,
    },
    extra: {
      type: Object,
    },
    notifyAt: {
      type: Date,
      required: true,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model<NotificationModelData>("notification", schema);
