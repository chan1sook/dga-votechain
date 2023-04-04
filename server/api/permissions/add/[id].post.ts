import UserModel from "~~/server/models/user"
import { checkPermissionNeeds, checkPermissionSelections, combinePermissions, isContainsAdvancePermissions } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionSelections(userData.permissions, "change-permissions:basic", "change-permissions:advance")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const { permissions } : RequestPermissionsAddFormData = await readBody(event);

  if(isContainsAdvancePermissions(...permissions) && !checkPermissionNeeds(userData.permissions, "change-permissions:advance")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const userDoc = await UserModel.findById(event.context.params?.id);
  if(!userDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "User not found",
    });
  }


  userDoc.permissions = combinePermissions(userDoc.permissions, ...permissions);

  await userDoc.save();

  if(userData.userid === userDoc.userid) {
    userData.permissions = userDoc.permissions;
  }

  const permissionsResponse : RequestPermissionsAddResponseData = {
    userid: userDoc.userid,
    permissions: userDoc.permissions,
  }
  return {
    permissionsResponse,
  }
})