import { type Types } from "mongoose";

declare global {
  type UserAuthSource = "digitalId" | "firebase";
  type UserRole = "guest" | "voter" | "admin" | "developer";
  
  interface UserModelData {
    permissions: EVotePermission[],
    authSources: UserAuthSourceData[],
    firstName?: string,
    lastName?: string,
    email?: string,
    isGovOfficer?: boolean,
    ministry?: string,
    department?: string,
    division?: string,
    hashedCitizenId: string,
    createdAt: Date,
    updatedAt: Date,
    group: string[],
    preferences: UserPreferences,
  }

  interface UserModelDataWithId extends UserModelData {
    _id: Types.ObjectId,
  }
  
  interface UserPreferences {
    topMenus: string[],
  }

  interface UserAuthSourceData {
    authSource: UserAuthSource,
    digitalIdUserId?: DigitalIDUserId,
    firebaseUid?: string,
  }
}