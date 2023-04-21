export const useToastData = () => {
  return useState<Array<ToastParams>>(() => []);
}