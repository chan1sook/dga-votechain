type UserResponseData = Omit<UserModelData,
  "authSources" | "createdAt" | "updatedAt" | "hashedCitizenId" | "permissions" | "preferences" | "group" |
  "bannedUntil" | "removeAt" | "removed"
> & {
  userid?: string,
  roleMode: UserRole,
  permissions?: EVotePermission[],
  preferences?: UserPreferences,
  hasCitizenId?: boolean,
  group?: string[],
  bannedUntil?: DateString,
}

interface UserSessionSavedData {
  userid: string,
  roleMode: UserRole,
  authFrom: UserAuthSourceData & {
    userToken?: string,
  },
}

type UserSessionData = Omit<UserModelData, "authSources" | "createdAt" | "updatedAt" | "hashedCitizenId"> & {
  _id: Types.ObjectId,
  hasCitizenId: boolean,
} & Omit<UserSessionSavedData, "userid">;

