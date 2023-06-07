import RequestPermissionsModel from "~/src/models/request-permission"
import NotificationModel from "~/src/models/notification";
import { getExistsRequestPermissionsData } from "~/src/services/fetch/permission";
import { checkPermissionNeeds } from "~/src/services/validations/permission";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionNeeds(userData.permissions, "request-permissions")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const existsRequests = await getExistsRequestPermissionsData(userData._id);
  if(existsRequests.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Already requested",
    });
  }

  const reqPermissionsData : RequestPermissionsFormData = await readBody(event);

  const today = new Date();
  const reqPermissions: RequestPermissionsModelData = {
    userid: userData._id.toString(),
    status: "pending",
    permissions: reqPermissionsData.permissions,
    note: reqPermissionsData.note,
    preset: reqPermissionsData.preset,
    createdAt: today,
    updatedAt: today,
  }
  const reqPermissionsDoc = await new RequestPermissionsModel(reqPermissions).save();
  
  await new NotificationModel(
    {
      userid: userData._id,
      group: "request-permission",
      extra: {
        id: reqPermissionsDoc._id.toString(),
        status: "pending",
      },
      notifyAt: today,
    }
  ).save();

  const requestPermissions : RequestPermissionsResponseData = {
    _id: `${reqPermissionsDoc._id}`,
    status: reqPermissionsDoc.status,
    userid: reqPermissionsDoc.userid,
    permissions: reqPermissionsDoc.permissions,
    note: reqPermissionsDoc.note,
    preset: reqPermissionsDoc.preset,
  }
  return {
    requestPermissions,
  }
})