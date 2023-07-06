import { loadServerConfigurations, updateConfigurations } from "~/src/services/fetch/config";
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

  const values : Record<string, any> = await readBody(event);
  console.log(values);

  await updateConfigurations(values);
  await loadServerConfigurations();
  
  return {
    status: "OK"
  }
});