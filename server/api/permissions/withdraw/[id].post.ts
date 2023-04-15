import UserModel from "~~/server/models/user"
import { checkPermissionSelections, removePermissions } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionSelections(userData.permissions, "change-others-permissions")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const { permissions } : RequestPermissionsWithdrawFormData = await readBody(event);
  
  const userDoc = await UserModel.findById(event.context.params?.id);
  if(!userDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "User not found",
    });
  }


  userDoc.permissions = removePermissions(userDoc.permissions, ...permissions);

  await userDoc.save();

  if(userData._id.toString() === userDoc._id.toString()) {
    userData.permissions = userDoc.permissions;
  }

  const permissionsResponse : RequestPermissionsWithdrawResponseData = {
    userid: userDoc._id.toString(),
    permissions: userDoc.permissions,
  }
  return {
    permissionsResponse,
  }
})