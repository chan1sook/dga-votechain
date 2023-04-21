export const useShowToast = (...params:Array<ToastParams>) => {
  useToastData().value.push(...params);
}