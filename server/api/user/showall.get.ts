import EVoteUserModel from "~~/server/models/user"
import { isAdminRole } from "~~/src/utils/role";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !isAdminRole(userData.roleMode)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const userDocs = await EVoteUserModel.find({});

  const users : Array<UserShowAdminResponseData> = userDocs.map((data) => {
    const role : UserRole = data.permissions.includes("dev-mode") ? "developer" : (data.permissions.includes("admin-mode") ? "admin" : "voter");
    return {
      _id: `${data._id}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role,
    }
  });

  return users;
})