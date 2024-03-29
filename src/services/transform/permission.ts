import {
  isAdminRole,
  isDeveloperRole,
  isVoterRole,
} from "~/src/services/validations/role";

export function legacyRoleToPermissionsExcludes(
  role: UserRole
): EVotePermission[] {
  switch (role) {
    case "voter":
      return ["request-permissions", "voter-mode", "vote-topic"];
    case "admin":
      return ["admin-mode", "create-topic", "change-topic", "control-topic"];
    case "developer":
      return ["dev-mode", "create-news", "change-news", "change-permissions"];
    default:
      return [];
  }
}

export function legacyRoleToPermissions(role: UserRole) {
  let permissions: EVotePermission[] = [];

  if (isVoterRole(role)) {
    permissions = combinePermissions(
      permissions,
      ...legacyRoleToPermissionsExcludes("voter")
    );
  }

  if (isAdminRole(role)) {
    permissions = combinePermissions(
      permissions,
      ...legacyRoleToPermissionsExcludes("admin")
    );
  }

  if (isDeveloperRole(role)) {
    permissions = combinePermissions(
      permissions,
      ...legacyRoleToPermissionsExcludes("developer")
    );
  }

  return permissions;
}

export function combinePermissions(
  source: EVotePermission[],
  ...others: EVotePermission[]
) {
  const result = source.slice(0);
  for (const permission of others) {
    if (!result.includes(permission)) {
      result.push(permission);
    }
  }
  return result;
}

export function removePermissions(
  target: EVotePermission[],
  ...removed: EVotePermission[]
) {
  const result = target.slice(0);
  for (const permission of removed) {
    const targetIndex = result.indexOf(permission);
    if (targetIndex !== -1) {
      result.splice(targetIndex, 1);
    }
  }
  return result;
}
