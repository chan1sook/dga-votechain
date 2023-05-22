import { isAdminRole, isDeveloperRole, isVoterRole } from "./role";
  
export function legacyRoleToPermissionsExcludes(role: UserRole) : Array<EVotePermission> {
  switch(role) {
    case "voter":
      return ["request-permissions", "voter-mode", "vote-topic", "transfer-topic-controller"];
    case "admin":
      return ["admin-mode", "create-topic", "change-topic", "grant-topic-controller", "create-news", "change-news", "change-permissions:basic"];
    case "developer":
      return ["dev-mode", "change-permissions:advance"];
    default:
      return [];
  }
}

export function legacyRoleToPermissions(role: UserRole) {
  const permissions : Array<EVotePermission> = [];
  
  if(isVoterRole(role)) {
    permissions.push(...legacyRoleToPermissionsExcludes("voter"));
  }

  if(isAdminRole(role)) {
    permissions.push(...legacyRoleToPermissionsExcludes("admin"));
  }

  if(isDeveloperRole(role)) {
    permissions.push(...legacyRoleToPermissionsExcludes("developer"));
  }
  
  return permissions;
}

export function getAdvancePermissions() {
  return combinePermissions(
    legacyRoleToPermissionsExcludes("admin"),
    ...legacyRoleToPermissionsExcludes("developer")
  );
}

export function isContainsAdvancePermissions(...selections: Array<EVotePermission>) {
  return removePermissions(selections, ...getAdvancePermissions()).length === 0;
}

export function getRequestablePermissions() : Array<EVotePermission> {
  return combinePermissions(
    legacyRoleToPermissionsExcludes("admin"),
    ...legacyRoleToPermissionsExcludes("developer")
  );
}

export function getPresetPermissions(value?: string) : Array<EVotePermission> {
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

export function checkPermissionNeeds(availables: Array<EVotePermission>, ...needs: Array<EVotePermission>) {
  const needsArrs = removePermissions(needs, ...availables);
  return needsArrs.length === 0;
}

export function checkPermissionSelections(availables: Array<EVotePermission>, ...selections: Array<EVotePermission>) {
  for(const permission of availables) {
    if(selections.includes(permission)) {
      return true;
    }
  }

  return false;
}

export function combinePermissions(a: Array<EVotePermission>, ...others: Array<EVotePermission>) {
  const result = a.slice(0);
  for(const permission of others) {
    if(!result.includes(permission)) {
      result.push(permission)
    }
  }
  return result;
}

export function removePermissions(target: Array<EVotePermission>, ...removed: Array<EVotePermission>) {
  const result = target.slice(0);
  for(const permission of removed) {
    const targetIndex = result.indexOf(permission);
    if(targetIndex !== -1) {
      result.splice(targetIndex, 1);
    }
  }
  return result;
}
