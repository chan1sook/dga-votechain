import type { Model, Query } from "mongoose";

declare global {
  type RequestPermissionPreset = "moderator" | "developer" | "custom";
  type RequestPermissionStatus = "pending" | "approved" | "rejected";

  interface RequestPermissionsData {
    _id?: Types.ObjectId;
    userid: Types.ObjectId;
    preset: RequestPermissionPreset;
    note: string;
    permissions: EVotePermission[];
    status: RequestPermissionStatus;
    createdAt: Date;
    updatedAt: Date;
  }

  interface RequestPermissionsModel extends Model<RequestPermissionsData> {
    getPendingRequestPermissionsData(pagesize?: number, startid?: string, advance?: boolean) : Query<RequestPermissionsData[], RequestPermissionsData>;
    getExistsRequestPermissionsData(userid: Types.ObjectId) : Query<RequestPermissionsDataWithPopulated[], RequestPermissionsDataWithPopulated>;
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
    userid: UserModelData & { _id: Types.ObjectId };
    preset: RequestPermissionPreset;
    note: string;
    permissions: EVotePermission[];
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
    newPermissions?: EVotePermission[],
  };
}