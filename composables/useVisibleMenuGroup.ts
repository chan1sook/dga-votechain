export const useVisibleMenuGroup = () => {
  return useState<string | undefined>('useVisibleMenuGroup', () => undefined)
}