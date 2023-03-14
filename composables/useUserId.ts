export const useUserId = () => {
  return useState<DigitalIDUserId | undefined>('userId', () => undefined)
}