import UserModel from "~/src/models/user"
import RequestPermissionsModel from "~~/server/models/request-permission"
import NotificationModel from "~~/server/models/notification";
import { checkPermissionSelections, combinePermissions, isContainsAdvancePermissions } from "~~/src/utils/permissions";
import { isAdminRole } from "~~/src/utils/role";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !isAdminRole(userData.roleMode)) {
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

  if(isContainsAdvancePermissions(...reqData.permissions) && userData.roleMode !== "developer" && !checkPermissionSelections(userData.permissions, "change-permissions:advance")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const userDoc = await UserModel.findOne({ _id: reqData.userid });
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
  
  const today = new Date();

  if(status === "approved") {
    const content = `{{notification.requestPermission.title}} #${reqData.id} {{notification.requestPermission.approved}}`
    await Promise.all([
      userDoc.save(),
      reqData.save(),
      new NotificationModel(
        {
          from: "system",
          target: [{ userid: userData._id }],
          title: content,
          content: content,
          notifyAt: today,
          createdAt: today,
          updatedAt: today,
          tags: [`request-${reqData._id}-approved`],
        }
      ).save(),
    ]);
  } else {
    const content = `{{notification.requestPermission.title}} #${reqData.id} {{notification.requestPermission.rejected}}`
    await Promise.all([
      reqData.save(),
      new NotificationModel(
        {
          from: "system",
          target: [{ userid: userData._id }],
          title: content,
          content: content,
          notifyAt: today,
          createdAt: today,
          updatedAt: today,
          tags: [`request-${reqData._id}-rejected`],
        }
      ).save()
    ]);
  }

  if(userData._id.toString() === userDoc._id.toString()) {
    userData.permissions = userDoc.permissions;
  }

  const requestPermissions : RequestPermissionsApproveResponseData = {
    _id: `${reqData._id}`,
    status: reqData.status,
    userid: reqData.userid,
    permissions: reqData.permissions,
    newPermissions: userDoc.permissions,
    note: reqData.note,
    preset: reqData.preset,
  }
  return {
    requestPermissions,
  }
})