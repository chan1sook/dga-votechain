import { Model, Query, Types } from "mongoose";

declare global {
  interface OldUserData {
    userid: DigitalIDUserId,
    role? : UserRole,
    permissions: Array<EVotePermission>,
    createdAt: Date;
    updatedAt: Date;
  }

  interface OldUserModel extends Model<OldUserData> {
    ensureUserData(userid: string) : Query<OldUserData, OldUserData>;
  }
}