import RequestPermissionsModel from "~~/server/models/request-permission"

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const existsRequests : RequestPermissionsDataWithPopulated[] = await RequestPermissionsModel.getExistsRequestPermissionsData(userData._id);
  const requestPermissions : RequestPermissionsListData | null = existsRequests[0] ? {
    _id: `${existsRequests[0]._id}`,
    status: existsRequests[0].status,
    userid: existsRequests[0].userid._id,
    permissions: existsRequests[0].permissions,
    personalData: {
      firstName: existsRequests[0].userid.firstName,
      lastName: existsRequests[0].userid.lastName,
      email: existsRequests[0].userid.email,
    },
    note: existsRequests[0].note,
    preset: existsRequests[0].preset,
  } : null;

  return {
    requestPermissions,
  }
})