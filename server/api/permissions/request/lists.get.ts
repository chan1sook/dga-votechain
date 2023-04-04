import RequestPermissionsModel from "~~/server/models/reqpermission"
import { checkPermissionNeeds, checkPermissionSelections, isContainsAdvancePermissions } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionSelections(userData.permissions, "change-permissions:basic", "change-permissions:advance")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  const { startid, pagesize } : PaginationParams = getQuery(event);

  const advanceMode = checkPermissionNeeds(userData.permissions, "change-permissions:advance");
  const reqPermissionData = await RequestPermissionsModel.getPendingRequestPermissionsData(advanceMode, pagesize, startid);

  const requestPermissions : Array<RequestPermissionsListData> = reqPermissionData.map((doc) => {
    return {
      _id: `${doc._id}`,
      status: doc.status,
      userid: doc.userid,
      permissions: doc.permissions,
      note: doc.note,
      digitalIdUserInfo: doc.digitalIdUserInfo,
      preset: doc.preset,
    }
  });

  return {
    requestPermissions,
  }
})