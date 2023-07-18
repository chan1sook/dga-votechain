import { checkPermissionNeeds } from "./permission";

export function isVoterRole(role: UserRole) {
  return role !== "guest";
}

export function isAdminRole(role?: UserRole) {
  return role && !["guest", "voter"].includes(role);
}

export function isDeveloperRole(role: UserRole) {
  return role === "developer";
}

export function isUserVoter(user?: { permissions: EVotePermission[] }) {
  return user && checkPermissionNeeds(user.permissions, "voter-mode");
}

export function isUserAdmin(user?: { permissions: EVotePermission[] }) {
  return user && checkPermissionNeeds(user.permissions, "admin-mode");
}

export function isUserDeveloper(user?: { permissions: EVotePermission[] }) {
  return user && checkPermissionNeeds(user.permissions, "dev-mode");
}
