import UserModel from "~~/src/models/user"
import RequestPermissionsModel from "~~/src/models/reqpermission"
import { checkPermissionNeeds, checkPermissionSelections, combinePermissions, isContainsAdvancePermissions } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionSelections(userData.permissions, "change-permissions:basic", "change-permissions:advance")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const { status } : RequestPermissionsApproveFormData = await readBody(event);
  const reqData = await RequestPermissionsModel.findById(event.context.params?.id);
  if(!reqData) {
    throw createError({
      statusCode: 404,
      statusMessage: "Request Data Not Found",
    });
  } else if(reqData.status !== "pending") {
    throw createError({
      statusCode: 400,
      statusMessage: "Can't change anymore",
    });
  }

  if(isContainsAdvancePermissions(...reqData.permissions) && !checkPermissionNeeds(userData.permissions, "change-permissions:advance")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  // assign here
  const userDoc = await UserModel.findOne({ userid: reqData.userid });
  if(!userDoc) {
    reqData.status = "rejected";
    await reqData.save();
    throw createError({
      statusCode: 400,
      statusMessage: "Userid not valid: Rejected",
    });
  }

  reqData.status = status;
  if(status === "approved") {
    userDoc.permissions = combinePermissions(userData.permissions, ...reqData.permissions);
  }

  await Promise.all([
    status === "approved" ? userDoc.save() : () => {},
    reqData.save()
  ])

  if(userData.userid === userDoc.userid) {
    userData.permissions = userDoc.permissions;
  }

  const requestPermissions : RequestPermissionsApproveResponseData = {
    _id: `${reqData._id}`,
    status: reqData.status,
    userid: reqData.userid,
    permissions: reqData.permissions,
    newPermissions: userDoc.permissions,
    note: reqData.note,
  }
  return {
    requestPermissions,
  }
})