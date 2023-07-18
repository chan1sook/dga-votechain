import { removePermissions } from "../transform/permission";

export function checkPermissionNeeds(
  availables: EVotePermission[],
  ...needs: EVotePermission[]
) {
  const needsArrs = removePermissions(needs, ...availables);
  return needsArrs.length === 0;
}

export function checkPermissionSelections(
  availables: EVotePermission[],
  ...selections: EVotePermission[]
) {
  for (const permission of availables) {
    if (selections.includes(permission)) {
      return true;
    }
  }

  return false;
}
