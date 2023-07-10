import UserModel from "~/src/models/user"
import { combinePermissions, removePermissions } from "~/src/services/transform/permission";
import { isUserDeveloper } from "~/src/services/validations/role";
import mongoose from "mongoose";
import { getNotSelfEditablePermissions } from "~/src/services/form/permission";
import { checkPermissionSelections } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || isBannedUser(userData)|| !isUserDeveloper(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const { permissions } : { permissions: EVotePermission[] } = await readBody(event);
  const userDoc = await UserModel.findById(event.context.params?.id);
  if(!userDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "User Data Not Found",
    });
  }

  const permissionDiffA = removePermissions(userDoc.permissions, ...permissions)
  const permissionDiffB = removePermissions(permissions, ...userDoc.permissions)
  const permissionDiff = combinePermissions(permissionDiffA, ...permissionDiffB)

  if(userDoc._id.toString() === userData._id.toString() && checkPermissionSelections(permissionDiff, ...getNotSelfEditablePermissions())) {
    throw createError({
      statusCode: 403,
      statusMessage: "Can't edit permissions",
    });
  }

  userDoc.permissions = permissions;
  userDoc.updatedAt = new Date();
  
  await userDoc.save();

  await dbSession.commitTransaction();
  await dbSession.endSession();

  if(userData._id.toString() === userDoc._id.toString()) {
    userData.permissions = userDoc.permissions;
  }

  return {
    status: "OK",
  }
})