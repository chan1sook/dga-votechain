import UserModel from "~/src/models/user"
import RequestPermissionsModel from "~/src/models/request-permission"
import NotificationModel from "~/src/models/notification";
import { combinePermissions } from "~/src/services/transform/permission";
import { isUserAdmin } from "~/src/services/validations/role";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || isBannedUser(userData)|| !isUserAdmin(userData)) {
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
    await Promise.all([
      userDoc.save(),
      reqData.save(),
      new NotificationModel(
        {
          userid: userData._id,
          group: "request-permission",
          extra: {
            id: reqData._id.toString(),
            status: "approved",
          },
          notifyAt: today,
        }
      ).save(),
    ]);
  } else {
    await Promise.all([
      reqData.save(),
      new NotificationModel(
        {
          userid: userData._id,
          group: "request-permission",
          extra: {
            id: reqData._id.toString(),
            status: "rejected",
          },
          notifyAt: today,
        }
      ).save()
    ]);
  }

  if(userData._id.toString() === userDoc._id.toString()) {
    userData.permissions = userDoc.permissions;
  }

  return {
    status: "OK",
  }
})