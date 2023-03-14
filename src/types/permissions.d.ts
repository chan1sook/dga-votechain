import { Model } from "mongoose";

declare global {
  type EVotePermissionUser = "access-pages:user" | "request-permissions" | "banned";
  type EVotePermissionVoter = "vote-topic" | "request-topic";
  type EVotePermissionAdmin = "access-pages:admin" | "create-topic" | "change-topic" | "create-news" | "change-news" | "change-permissions:basic";
  type EVotePermissionDeveloper = "access-pages:developer" | "change-permissions:advance";
  type EVotePermission = EVotePermissionUser | EVotePermissionVoter | EVotePermissionAdmin | EVotePermissionDeveloper;

  type RequestPermissionStatus = "pending" | "approved" | "rejected";

  interface RequestPermissionsData {
    _id?: Types.ObjectId;
    userid: DigitalIDUserId;
    digitalIdUserInfo: DigitalIDUserDataResponse;
    note: string;
    permissions: Array<EVotePermission>;
    status: RequestPermissionStatus;
    createdAt: Date;
    updatedAt: Date;
  }

  interface RequestPermissionsModel extends Model<RequestPermissionsData> {

  }

  type RequestPermissionsFormData = Omit<RequestPermissionsData, "_id" | "userid" | "status" | "digitalIdUserInfo" | "createdAt" | "updatedAt">;
  type RequestPermissionsApproveFormData = {
    status: Exclude<RequestPermissionStatus, "pending">,
  };
  
  type RequestPermissionsResponseData = Omit<RequestPermissionsData,  "_id" | "createdAt" | "updatedAt" | "digitalIdUserInfo"> & {
    _id: string,
  }

  type RequestPermissionsListData = RequestPermissionsResponseData & Pick<RequestPermissionsData, "digitalIdUserInfo">;
  
  type RequestPermissionsApproveResponseData = RequestPermissionsResponseData & {
    newPermissions?: Array<EVotePermission>,
  };
  
  type RequestPermissionsAddFormData = Pick<RequestPermissionsData, "permissions">;
  type RequestPermissionsWithdrawFormData = RequestPermissionsAddFormData ;

  type RequestPermissionsAddResponseData = Pick<UserData, "userid" | "permissions">;
  type RequestPermissionsWithdrawResponseData = RequestPermissionsAddResponseData;
}