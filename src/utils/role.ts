export function isVoterRole(role: UserRole) {
  return role !== "guest";
}

export function isAdminRole(role?: UserRole) {
  return role && !["guest", "voter"].includes(role);
}

export function isDeveloperRole(role: UserRole) {
  return role === "developer";
}