export const useSessionData = () => {
  return useState<{
    sid: string | undefined
    userid: DigitalIDUserId | undefined,
    permissions: Array<EVotePermission>,
    roleMode: UserRole | undefined,
    firstName: string | undefined,
    lastName: string | undefined,
    email: string | undefined,
  }>('useSessionData', () => {
    return {
      sid: undefined,
      userid: undefined,
      permissions: [],
      roleMode: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
    }
  })
}