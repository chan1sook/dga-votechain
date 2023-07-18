import UserModel from "~/src/models/user";
import { isAdminRole, isUserAdmin } from "~/src/services/validations/role";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if (!userData || isBannedUser(userData) || !isUserAdmin(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const userDoc = await UserModel.findById(event.context.params?.id);
  if (!userDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }
  const user: UserResponseDataWithIdAndPermissions = {
    _id: `${userDoc._id}`,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    email: userDoc.email,
    permissions: userDoc.permissions,
  };

  return user;
});
