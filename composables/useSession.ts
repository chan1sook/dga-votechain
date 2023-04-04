export const useSessionData = () => {
  return useState<{
    sid: string | undefined
    userid: DigitalIDUserId | undefined,
    permissions: Array<EVotePermission>,
    roleMode: UserRole | undefined,
    digitalIdUserInfo: DigitalIDUserDataResponse | undefined,
  }>('useSessionData', () => {
    return {
      sid: undefined,
      userid: undefined,
      permissions: [],
      roleMode: undefined,
      digitalIdUserInfo: undefined,
    }
  })
}