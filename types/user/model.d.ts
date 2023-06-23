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
    hashedCitizenId?: string,
    createdAt: Date,
    updatedAt: Date,
    preferences: UserPreferences,
    bannedUntil?: Date,
    removeAt?: Date,
    removed?: boolean,
  }

  interface UserModelDataWithId extends UserModelData {
    _id: Types.ObjectId,
  }
  
  type PreferenceTopMenuOption = "home" | "voting" | "about" | "help" | "contact-us" | "users-management" | "blockchain";
  
  interface UserPreferences {
    topMenus: PreferenceTopMenuOption[],
    adminTopMenus: PreferenceTopMenuOption[],
    devTopMenus: PreferenceTopMenuOption[],
  }

  interface UserAuthSourceData {
    authSource: UserAuthSource,
    digitalIdUserId?: DigitalIdUserId,
    firebaseUid?: string,
  }
}