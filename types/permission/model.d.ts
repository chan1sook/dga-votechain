import { type Types } from "mongoose";

declare global {
  interface RequestPermissionsModelData {
    _id?: Types.ObjectId;
    userid: Types.ObjectId;
    preset: RequestPermissionPreset;
    note: string;
    permissions: EVotePermission[];
    status: RequestPermissionStatus;
    createdAt: Date;
    updatedAt: Date;
  }

  type RequestPermissionsModelDataWithPopulated = Omit<
    RequestPermissionsModelData,
    "_id" | "userid"
  > & {
    _id: Types.ObjectId;
    userid: UserModelData & { _id: Types.ObjectId };
    preset: RequestPermissionPreset;
    note: string;
    permissions: EVotePermission[];
    status: RequestPermissionStatus;
    createdAt: Date;
    updatedAt: Date;
  };
}
