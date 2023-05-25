import type { Model, Query } from "mongoose";

declare global {
  type EVotePermissionBasic = "request-permissions";
  type EVotePermissionVoter = "voter-mode" | "vote-topic" | "request-topic" ;
  type EVotePermissionAdmin = "admin-mode" | "create-topic" | "change-topic" | "create-news" | "change-news" | "change-permissions:basic";
  type EVotePermissionDeveloper = "dev-mode" | "change-permissions:advance";

  type EVotePermissionUnused = "access-pages:user" | "access-notifications" | "transfer-topic-controller"  | "grant-topic-controller" | "access-pages:admin" | "access-pages:developer";

  type EVotePermission = EVotePermissionBasic | EVotePermissionVoter | EVotePermissionAdmin | EVotePermissionDeveloper | EVotePermissionUnused;

  type RequestPermissionPreset = "moderator" | "developer" | "custom";
  type RequestPermissionStatus = "pending" | "approved" | "rejected";

  interface RequestPermissionsData {
    _id?: Types.ObjectId;
    userid: Types.ObjectId;
    preset: RequestPermissionPreset;
    note: string;
    permissions: Array<EVotePermission>;
    status: RequestPermissionStatus;
    createdAt: Date;
    updatedAt: Date;
  }

  interface RequestPermissionsModel extends Model<RequestPermissionsData> {
    getPendingRequestPermissionsData(pagesize?: number, startid?: string, advance?: boolean) : Query<Array<RequestPermissionsData>, RequestPermissionsData>;
    getExistsRequestPermissionsData(userid: Types.ObjectId) : Query<Array<RequestPermissionsDataWithPopulated>, RequestPermissionsDataWithPopulated>;
  }

  type RequestPermissionsFormData = Omit<RequestPermissionsData, "_id" | "userid" | "status" | "digitalIdUserInfo" | "createdAt" | "updatedAt">;
  type RequestPermissionsApproveFormData = {
    status: Exclude<RequestPermissionStatus, "pending">,
  };
  
  type RequestPermissionsResponseData = Omit<RequestPermissionsData,  "_id" | "createdAt" | "updatedAt" | "digitalIdUserInfo"> & {
    _id: string,
  }

  type RequestPermissionsDataWithPopulated = Omit<RequestPermissionsData, "_id" | "userid"> & {
    _id: Types.ObjectId;
    userid: UserData & { _id: Types.ObjectId };
    preset: RequestPermissionPreset;
    note: string;
    permissions: Array<EVotePermission>;
    status: RequestPermissionStatus;
    createdAt: Date;
    updatedAt: Date;
  }

  type RequestPermissionsListData = RequestPermissionsResponseData & {
    personalData: {
      firstName?: string,
      lastName?: string,
      email?: string,
    }
  };
  
  type RequestPermissionsApproveResponseData = RequestPermissionsResponseData & {
    newPermissions?: Array<EVotePermission>,
  };
  
  type RequestPermissionsAddFormData = Pick<RequestPermissionsData, "permissions">;
  type RequestPermissionsWithdrawFormData = RequestPermissionsAddFormData ;

  type RequestPermissionsAddResponseData = Pick<UserData, "userid" | "permissions">;
  type RequestPermissionsWithdrawResponseData = RequestPermissionsAddResponseData;
}