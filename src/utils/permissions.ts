import { isAdminRole, isDeveloperRole, isVoterRole } from "~~/src/utils/role";
  
export function legacyRoleToPermissionsExcludes(role: UserRole) : EVotePermission[] {
  switch(role) {
    case "voter":
      return ["request-permissions", "voter-mode", "vote-topic", "request-topic"];
    case "admin":
      return ["admin-mode", "create-topic", "change-topic", "create-news", "change-news", "change-permissions:basic"];
    case "developer":
      return ["dev-mode", "change-permissions:advance"];
    default:
      return [];
  }
}

export function legacyRoleToPermissions(role: UserRole) {
  let permissions : EVotePermission[] = [];
  
  if(isVoterRole(role)) {
    permissions = combinePermissions(permissions, ...legacyRoleToPermissionsExcludes("voter"));
  }

  if(isAdminRole(role)) {
    permissions = combinePermissions(permissions, ...legacyRoleToPermissionsExcludes("admin"));
  }

  if(isDeveloperRole(role)) {
    permissions = combinePermissions(permissions, ...legacyRoleToPermissionsExcludes("developer"));
  }
  
  return permissions;
}

export function getBasicPermissions() {
  return legacyRoleToPermissionsExcludes("voter");
}
export function getAdvancePermissions() {
  return combinePermissions(
    legacyRoleToPermissionsExcludes("admin"),
    ...legacyRoleToPermissionsExcludes("developer")
  );
}

export function getUnusedPermissions() : EVotePermission[] {
  return ["access-pages:user", "access-notifications", "transfer-topic-controller", "grant-topic-controller", "access-pages:admin", "access-pages:developer"]
}

export function getNotSelfEditablePermissions() : EVotePermission[] {
  return ["voter-mode", "admin-mode", "dev-mode", "change-permissions:basic", "change-permissions:advance"]
}

export function isContainsAdvancePermissions(...selections: EVotePermission[]) {
  return removePermissions(selections, ...getAdvancePermissions()).length === 0;
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

export function checkPermissionNeeds(availables: EVotePermission[], ...needs: EVotePermission[]) {
  const needsArrs = removePermissions(needs, ...availables);
  return needsArrs.length === 0;
}

export function checkPermissionSelections(availables: EVotePermission[], ...selections: EVotePermission[]) {
  for(const permission of availables) {
    if(selections.includes(permission)) {
      return true;
    }
  }

  return false;
}

export function combinePermissions(source: EVotePermission[], ...others: EVotePermission[]) {
  const result = source.slice(0);
  for(const permission of others) {
    if(!result.includes(permission)) {
      result.push(permission)
    }
  }
  return result;
}

export function removePermissions(target: EVotePermission[], ...removed: EVotePermission[]) {
  const result = target.slice(0);
  for(const permission of removed) {
    const targetIndex = result.indexOf(permission);
    if(targetIndex !== -1) {
      result.splice(targetIndex, 1);
    }
  }
  return result;
}
