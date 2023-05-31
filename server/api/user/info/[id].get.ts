import { FilterQuery } from "mongoose";
import EVoteUserModel from "~~/server/models/user"
import { isAdminRole } from "~~/src/utils/role";
import { escapeRegExp } from "~~/src/utils/utils";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !isAdminRole(userData.roleMode)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const userDoc = await EVoteUserModel.findById(event.context.params?.id);
  if(!userDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }
  const user : UserPermissionsResponseData = {
    _id: `${userDoc._id}`,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    email: userDoc.email,
    permissions: userDoc.permissions,
  };

  return user;
})