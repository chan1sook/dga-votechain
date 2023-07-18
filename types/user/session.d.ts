type UserResponseData = Omit<
  UserModelData,
  | "authSources"
  | "createdAt"
  | "updatedAt"
  | "cidHashed"
  | "permissions"
  | "preferences"
  | "bannedUntil"
  | "removeAt"
  | "removed"
> & {
  userid?: string;
  roleMode: UserRole;
  permissions?: EVotePermission[];
  preferences?: UserPreferencesModel;
  hasCitizenId?: boolean;
  bannedUntil?: DateString;
};

interface UserSessionSavedData {
  userid: string;
  roleMode: UserRole;
  authFrom: UserAuthSourceData & {
    userToken?: string;
  };
}

type UserSessionData = Omit<
  UserModelData,
  "authSources" | "createdAt" | "updatedAt" | "cidHashed"
> & {
  _id: Types.ObjectId;
  hasCitizenId: boolean;
} & Omit<UserSessionSavedData, "userid">;
