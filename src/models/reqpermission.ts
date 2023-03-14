import { model, Schema } from "mongoose";

const schema = new Schema<RequestPermissionsData, RequestPermissionsModel>({
  userid: {
    type: String,
    required: true,
  },
  digitalIdUserInfo: {
    type: Object,
    required: true,
  },
  note: {
    type: String,
  },
  permissions: [String],
  status: {
    type: String,
    required: true,
  },
}, { timestamps: true });


export default model<RequestPermissionsData, RequestPermissionsModel>('reqpermissions', schema);