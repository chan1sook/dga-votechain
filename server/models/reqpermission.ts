import { FilterQuery, model, Schema, Types } from "mongoose";
import { getNtpTime } from "~~/server/ntp";
import { getAdvancePermissions } from "~~/src/utils/permissions";

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
  preset: {
    type: String,
    default: "custom",
  },
  permissions: [String],
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});

schema.pre('save', async function () {
  const today = await getNtpTime();
  if (!this.createdAt) {
    this.createdAt = today;
  }
  this.updatedAt = today;
});

schema.static("getPendingRequestPermissionsData", function getRequestPermissionsData(
  advance: boolean, pagesize?: number, startid?: string
)  {
  const query : FilterQuery<RequestPermissionsData> = {
    status: "pending"
  };
  
  if(!advance) {
    query.permissions = { $nin: getAdvancePermissions() } 
  }

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getExistsRequestPermissionsData", function getExistsRequestPermissionsData(userid: DigitalIDUserId) {
  const query : FilterQuery<RequestPermissionsData> = {
    status: "pending",
    userid: userid,
  };
  
  return this.find(query);
});

export default model<RequestPermissionsData, RequestPermissionsModel>('reqpermissions', schema);