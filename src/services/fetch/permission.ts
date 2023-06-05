import { FilterQuery, Types } from "mongoose";
import RequestPermissionsModel from "~/src/models/request-permission"
import { getAdvancePermissions } from "../form/permission";

export function getPendingRequestPermissionsData(
  pagesize?: number, startid?: string, advance?: boolean
)  {
  const query : FilterQuery<RequestPermissionsModelData> = {
    status: "pending"
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }

  if(!advance) {
    query.permissions = {
      $nin: getAdvancePermissions(),
    }
  }
  
  return RequestPermissionsModel.find(query).limit(pagesize || 50).sort({_id: -1 });
};

export function getExistsRequestPermissionsData(userid: Types.ObjectId) {
  const query : FilterQuery<RequestPermissionsModelData> = {
    status: "pending",
    userid: userid,
  };
  
  return RequestPermissionsModel.find(query);
}


export function getRequestPermissionsDataById(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const query : FilterQuery<RequestPermissionsModelData> = {
    userid: userid,
  };
  
  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }

  return RequestPermissionsModel.find(query).sort({ _id: -1 }).limit(pagesize || 50);
}