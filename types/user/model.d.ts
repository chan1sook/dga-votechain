import { type Types } from "mongoose";

declare global {
  type UserAuthSource = "digitalId" | "thaID";
  type UserRole = "guest" | "voter" | "admin" | "developer";

  interface UserModelData {
    permissions: EVotePermission[];
    authSources: UserAuthSourceData[];
    firstName?: string;
    lastName?: string;
    email?: string;
    isGovOfficer?: boolean;
    ministry?: string;
    department?: string;
    division?: string;
    cidHashed?: string;
    createdAt: Date;
    updatedAt: Date;
    preferences: UserPreferencesModel;
    bannedUntil?: Date;
    removeAt?: Date;
    removed?: boolean;
  }

  interface UserModelDataWithId extends UserModelData {
    _id: Types.ObjectId;
  }

  type PreferenceTopMenuOption =
    | "home"
    | "voting"
    | "about"
    | "help"
    | "contact-us"
    | "users-management"
    | "blockchain"
    | "server-config"
    | "monitor";

  interface UserPreferencesModel {
    topMenu: UserPreferencesTopMenu;
  }

  type UserPreferencesTopMenu = PreferenceTopMenuOption[];

  interface UserAuthSourceData {
    authSource: UserAuthSource;
    digitalIdUserId?: DigitalIdUserId;
    thaIDUserId?: ThaIDUserId;
  }
}
