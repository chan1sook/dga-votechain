import { combinePermissions, legacyRoleToPermissionsExcludes } from "../transform/permission";

export function getBasicPermissions() {
  return legacyRoleToPermissionsExcludes("voter");
}
export function getAdvancePermissions() {
  return combinePermissions(
    legacyRoleToPermissionsExcludes("admin"),
    ...legacyRoleToPermissionsExcludes("developer")
  );
}

export function getNotSelfEditablePermissions() : EVotePermission[] {
  return ["voter-mode", "admin-mode", "dev-mode", "change-permissions:basic", "change-permissions:advance"]
}

export function getRequestablePermissions() : EVotePermission[] {
  return combinePermissions(
    legacyRoleToPermissionsExcludes("admin"),
    ...legacyRoleToPermissionsExcludes("developer")
  );
}

export function getPresetPermissions(value?: string) : EVotePermission[] {
  switch(value) {
    case "moderator":
      return legacyRoleToPermissionsExcludes("admin");
    case "developer":
      return combinePermissions(
        legacyRoleToPermissionsExcludes("admin"),
        ...legacyRoleToPermissionsExcludes("developer")
      );
    default:
      return legacyRoleToPermissionsExcludes("admin");
  }
}