import RequestPermissionsModel from "~~/server/models/reqpermission"
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import NotificationModel from "~~/server/models/notification";
import { getNtpTime } from "~~/server/ntp";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionNeeds(userData.permissions, "request-permissions")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const existsRequests = await RequestPermissionsModel.getExistsRequestPermissionsData(userData.userid);
  if(existsRequests.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Already requested",
    });
  }

  const reqPermissionsData : RequestPermissionsFormData = await readBody(event);

  const today = await getNtpTime();
  const reqPermissions: RequestPermissionsData = {
    userid: userData.userid,
    status: "pending",
    digitalIdUserInfo: userData.digitalIdUserInfo,
    permissions: reqPermissionsData.permissions,
    note: reqPermissionsData.note,
    preset: reqPermissionsData.preset,
    createdAt: today,
    updatedAt: today,
  }
  const reqPermissionsDoc = await new RequestPermissionsModel(reqPermissions).save();
  
  await new NotificationModel(
    {
      from: "system",
      target: [{ citizenId: userData.digitalIdUserInfo.citizen_id }],
      title: `Request Permission #${reqPermissionsDoc.id} in progress`,
      content: `Request Permission #${reqPermissionsDoc.id} in progress`,
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