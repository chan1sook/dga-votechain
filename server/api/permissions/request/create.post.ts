import RequestPermissionsModel from "~~/server/models/request-permission"
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import NotificationModel from "~~/server/models/notification";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionNeeds(userData.permissions, "request-permissions")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const existsRequests = await RequestPermissionsModel.getExistsRequestPermissionsData(userData._id);
  if(existsRequests.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Already requested",
    });
  }

  const reqPermissionsData : RequestPermissionsFormData = await readBody(event);

  const today = new Date();
  const reqPermissions: RequestPermissionsData = {
    userid: userData._id.toString(),
    status: "pending",
    permissions: reqPermissionsData.permissions,
    note: reqPermissionsData.note,
    preset: reqPermissionsData.preset,
    createdAt: today,
    updatedAt: today,
  }
  const reqPermissionsDoc = await new RequestPermissionsModel(reqPermissions).save();
  
  const content = `{{notification.requestPermission.title}} #${reqPermissionsDoc.id} {{otification.requestPermission.inProgress}}`
  await new NotificationModel(
    {
      from: "system",
      target: [{ userid: userData._id }],
      title: content,
      content: content,
      notifyAt: today,
      createdAt: today,
      updatedAt: today,
      tags: [`request-${reqPermissionsDoc._id}-pending`],
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