import RequestPermissionsModel from "~~/src/models/reqpermission"
import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionNeeds(userData.permissions, "request-permissions")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const reqPermissionsData : RequestPermissionsFormData = await readBody(event);

  const reqPermissionsDoc: RequestPermissionsData = {
    userid: userData.userid,
    status: "pending",
    digitalIdUserInfo: userData.digitalIdUserInfo,
    permissions: reqPermissionsData.permissions,
    note: reqPermissionsData.note,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  await new RequestPermissionsModel(reqPermissionsDoc).save();
  const requestPermissions : RequestPermissionsResponseData = {
    _id: `${reqPermissionsDoc._id}`,
    status: reqPermissionsDoc.status,
    userid: reqPermissionsDoc.userid,
    permissions: reqPermissionsDoc.permissions,
    note: reqPermissionsDoc.note,
  }
  return {
    requestPermissions,
  }
})