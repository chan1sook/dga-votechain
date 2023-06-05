import { model, Schema } from "mongoose";

const schema = new Schema<ReadNotificationModelData>({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "dga-user"
  },
  group: {
    type: String,
    required: true,
  },
  notifyAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export default model<ReadNotificationModelData>('read-notification', schema);