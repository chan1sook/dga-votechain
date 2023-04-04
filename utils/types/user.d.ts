import { Model, Query, Types } from "mongoose";

declare global {
  type UserRole = "guest" | "voter" | "admin" | "developer";

  interface UserDatabaseData {
    userid: DigitalIDUserId,
    role? : UserRole,
    permissions: Array<EVotePermission>,
    createdAt: Date;
  }

  interface UserModel extends Model<UserDatabaseData> {
    ensureUserData(userid: string) : Query<UserDatabaseData, UserDatabaseData>;
  }

  type UserData = UserDatabaseData & {
    idToken: string,
    accessToken: string,
    digitalIdUserInfo: DigitalIDUserDataResponse,
    roleMode: UserRole,
  }

  type UserSessionStorageData = Pick<UserData, "userid" | "accessToken" | "idToken" | "roleMode">;
  
  interface UserResponseData {
    sid: string,
    userid?: DigitalIDUserId,
    digitalIdUserInfo?: DigitalIDUserDataResponse,
    roleMode?: UserRole,
    permissions: Array<EVotePermission>,
  }
}