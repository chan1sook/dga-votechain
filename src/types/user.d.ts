import { Model, Query, Types } from "mongoose";

declare global {
  type UserRole = "guest" | "voter" | "admin" | "developer";

  interface UserDatabaseData {
    userid: DigitalIDUserId,
    role?: UserRole,
    permissions: Array<EVotePermission>,
    createdAt: Date;
    updatedAt: Date;
  }

  interface UserModel extends Model<UserDatabaseData> {
    ensureUserData(userid: string) : Query<UserDatabaseData, UserDatabaseData>;
  }

  type UserData = UserDatabaseData & {
    idToken: string,
    accessToken: string,
    digitalIdUserInfo: DigitalIDUserDataResponse,
  }

  type UserSessionStorageData = Pick<UserData, "userid" | "accessToken" | "idToken">;
  
  interface UserResponseData {
    userid?: DigitalIDUserId,
    role?: UserRole,
    permissions: Array<EVotePermission>,
  }
}