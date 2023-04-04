import RequestPermissionsModel from "~~/server/models/reqpermission"

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const existsRequests = await RequestPermissionsModel.getExistsRequestPermissionsData(userData.userid);
  const requestPermissions : RequestPermissionsListData | null = existsRequests[0] ? {
    _id: `${existsRequests[0]._id}`,
    status: existsRequests[0].status,
    userid: existsRequests[0].userid,
    permissions: existsRequests[0].permissions,
    note: existsRequests[0].note,
    digitalIdUserInfo: existsRequests[0].digitalIdUserInfo,
    preset: existsRequests[0].preset,
  } : null;

  return {
    requestPermissions,
  }
})