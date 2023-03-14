export const usePermissions = () => {
  return useState<Array<EVotePermission>>('permissions', () => [])
}