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

schema.index({
  _id: 1,
  userid: 1,
  readAt: 1,
  notifyAt: 1,
});

export default model<NotificationModelData>("notification", schema);
