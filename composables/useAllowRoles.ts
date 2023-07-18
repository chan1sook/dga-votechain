export const useAllowRoles = () => {
  return useState<UserRole[]>("useAllowRoles", () => {
    return ["guest", "voter", "admin", "developer"];
  });
};
