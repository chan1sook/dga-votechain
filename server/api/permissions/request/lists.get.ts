import dayjs from "dayjs";
import { getPendingRequestPermissionsData } from "~/src/services/fetch/permission";
import { checkPermissionSelections } from "~/src/services/validations/permission";
import { isAdminRole } from "~/src/services/validations/role";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !isAdminRole(userData.roleMode)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  const { startid, pagesize } : PaginationParams = getQuery(event);
  const isAdvanceMode = userData.roleMode === "developer" && checkPermissionSelections(userData.permissions, "change-permissions:advance");
  const reqPermissionData : RequestPermissionsModelDataWithPopulated[] = await getPendingRequestPermissionsData(pagesize, startid, isAdvanceMode).populate("userid");
  
  const requestPermissions : RequestPermissionsListData[] = reqPermissionData.map((doc) => {
    return {
      _id: `${doc._id}`,
      status: doc.status,
      userid: doc.userid._id,
      permissions: doc.permissions,
      note: doc.note,
      personalData: {
        firstName: doc.userid.firstName,
        lastName: doc.userid.lastName,
        email: doc.userid.email,
      },
      createdAt: dayjs(doc.createdAt).toISOString(),
      updatedAt: dayjs(doc.updatedAt).toISOString(),
      preset: doc.preset,
    }
  });

  return {
    requestPermissions,
  }
})