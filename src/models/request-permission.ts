import { model, Schema } from "mongoose";

const schema = new Schema<RequestPermissionsModelData>(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "dga-user",
    },
    note: {
      type: String,
    },
    preset: {
      type: String,
      default: "custom",
    },
    permissions: [String],
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

schema.index({
  _id: 1,
  userid: 1,
  status: 1,
});

export default model<RequestPermissionsModelData>("request-permission", schema);
