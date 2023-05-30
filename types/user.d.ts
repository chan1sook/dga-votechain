import { Model, Query, Types } from "mongoose";

declare global {
  type UserRole = "guest" | "voter" | "admin" | "developer";
  
  interface UserData {
    permissions: Array<EVotePermission>,
    authSources: Array<UserAuthSource>,
    firstName?: string,
    lastName?: string,
    email?: string,
    ministry?: string,
    department?: string,
    division?: string,
    citizenId?: string,
    hashedCitizenId: string,
    createdAt: Date,
    updatedAt: Date,
    group: Array<string>,
    preferences: UserPreference,
  }
  
  interface UserAuthSource {
    authSource: "digitalId" | "firebase",
    digitalIdUserId?: DigitalIDUserId,
    firebaseUid?: string,
  }
  
  interface UserPreference {
    topMenus: Array<string>,
  }
  
  interface UserSessionSavedData {
    userid: string,
    roleMode: UserRole,
    authFrom: UserAuthSource & {
      digitalUserIdToken?: string,
    },
  }

  type UserSessionData = Omit<UserData, "authSources" | "hashedCitizenId"> & { _id: Types.ObjectId } & Omit<UserSessionSavedData, "userid">;

  type UserResponseData = {
    sid: string,
    userid?: string,
    roleMode?: UserRole,
  } & Pick<UserData, "permissions" | "firstName" | "lastName" | "email">;

  type UserResponseFilterData = Pick<UserResponseData, "firstName" | "lastName" | "email"> & {
    _id: Types.ObjectId
  };

  type UserSearchQueryParams = {
    keyword?: string
  }
  type UserSearchResponseData = {
    _id: string,
    role: UserRole,
  } & Pick<UserData, "firstName" | "lastName" | "email">;

  type UserPermissionsFormData = {
    _id: string,
    firstName? : string,
    lastName? : string,
    email? : string,
    permissions: Array<EVotePermission>,
  }
}