import { FilterQuery, model, Schema, Types } from "mongoose";
import { getAdvancePermissions } from "~~/src/utils/permissions";

const schema = new Schema<RequestPermissionsData, RequestPermissionsModel>({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "dga-user"
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
}, { timestamps: true });

schema.static("getPendingRequestPermissionsData", function getRequestPermissionsData(
  pagesize?: number, startid?: string
)  {
  const query : FilterQuery<RequestPermissionsData> = {
    status: "pending"
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 }).populate("userid");
});

schema.static("getExistsRequestPermissionsData", function getExistsRequestPermissionsData(userid: Types.ObjectId) {
  const query : FilterQuery<RequestPermissionsData> = {
    status: "pending",
    userid: userid,
  };
  
  return this.find(query).populate("userid");
});

export default model<RequestPermissionsData, RequestPermissionsModel>('request-permission', schema);