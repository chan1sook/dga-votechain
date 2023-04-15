import { Model, Query, Types } from "mongoose";

declare global {
  type UserRole = "guest" | "voter" | "admin" | "developer";

  interface UserAuthSource {
    authSource: "digitalId",
    digitalIdUserId?: DigitalIDUserId,
  }
  
  interface UserData {
    version: Number,
    permissions: Array<EVotePermission>,
    authSources: Array<UserAuthSource>,
    firstName?: string,
    lastName?: string,
    email?: string,
    citizenId?: string,
    createdAt: Date,
    updatedAt: Date,
  }
  
  interface UserSessionSavedData {
    userid: string,
    roleMode: UserRole,
    digitalUserIdToken?: string,
  }

  type UserSessionData = Omit<UserData, "authSources"> & { _id: Types.ObjectId } & Omit<UserSessionSavedData, "userid">;

  type UserResponseData = {
    sid: string,
    userid?: string,
    roleMode?: UserRole,
  } & Pick<UserData, "permissions" | "firstName" | "lastName" | "email">;

  type UserResponseFilterData = Pick<UserResponseData, "_id" | "firstName" | "lastName" | "email">;

  type UserSearchQueryParams = {
    keyword?: string
  }
  type UserSearchResponseData = {
    _id: string,
  } & Pick<UserData, "firstName" | "lastName" | "email">;

  type TopicVoterAllowDataPopulated = Omit<TopicVoterAllowData, "userid"> & { userid?: UserData & { _id: Types.ObjectId } }
}