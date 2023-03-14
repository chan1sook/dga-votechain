import RequestPermissionsModel from "~~/src/models/reqpermission"
import { checkPermissionNeeds, checkPermissionSelections, isContainsAdvancePermissions } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionSelections(userData.permissions, "change-permissions:basic", "change-permissions:advance")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  let permissionArr = await RequestPermissionsModel.find({
    status: "pending",
  });

  if(!checkPermissionNeeds(userData.permissions, "change-permissions:advance")) {
    permissionArr = permissionArr.filter((ele) => {
      return !isContainsAdvancePermissions(...ele.permissions);
    })
  }


  const requestPermissions : Array<RequestPermissionsListData> = permissionArr.map((doc) => {
    return {
      _id: `${doc._id}`,
      status: doc.status,
      userid: doc.userid,
      permissions: doc.permissions,
      note: doc.note,
      digitalIdUserInfo: doc.digitalIdUserInfo,
    }
  });

  return {
    requestPermissions,
  }
})