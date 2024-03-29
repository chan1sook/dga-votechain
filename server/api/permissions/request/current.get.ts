import { getExistsRequestPermissionsData } from "~/src/services/fetch/permission";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if (!userData || isBannedUser(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const existsRequests: RequestPermissionsModelDataWithPopulated[] =
    await getExistsRequestPermissionsData(userData._id).populate("userid");
  const requestPermissions: RequestPermissionsListData | null =
    existsRequests[0]
      ? {
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
        }
      : null;

  return {
    requestPermissions,
  };
});
