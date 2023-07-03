import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || isBannedUser(userData) || !checkPermissionNeeds(userData.permissions, "dev-mode") || userData.roleMode !== 'developer') {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  throw createError({
    statusCode: 501,
    statusMessage: "Not Implemented",
  });
});