import UserModel from "~~/server/models/user"
import { checkPermissionSelections, combinePermissions, getNotSelfEditablePermissions, isContainsAdvancePermissions, removePermissions } from "~~/src/utils/permissions";
import { isAdminRole } from "~~/src/utils/role";
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !isAdminRole(userData.roleMode)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const { permissions } : { permissions: Array<EVotePermission> } = await readBody(event);
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

  console.log("permissionDiff", permissionDiff)

  if(isContainsAdvancePermissions(...permissionDiff) && userData.roleMode !== "developer" && !checkPermissionSelections(userData.permissions, "change-permissions:advance")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

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