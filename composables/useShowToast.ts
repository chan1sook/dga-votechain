export const useShowToast = (...params: ToastParams[]) => {
  useToastData().value.push(...params);
}