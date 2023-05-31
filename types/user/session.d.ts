type UserResponseData = Omit<UserModelData, "authSources" | "createdAt" | "updatedAt" | "hashedCitizenId" | "permissions" | "preferences" | "group"> & {
  userid?: string,
  roleMode: UserRole,
  permissions?: EVotePermission[],
  preferences?: UserPreferences,
  hasCitizenId?: boolean,
  group?: string[],
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

