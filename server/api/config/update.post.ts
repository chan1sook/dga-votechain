import {
  loadServerConfigurations,
  updateConfigurations,
} from "~/src/services/fetch/config";
import { isUserDeveloper } from "~/src/services/validations/role";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if (!userData || isBannedUser(userData) || !isUserDeveloper(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const values: Record<string, any> = await readBody(event);

  await updateConfigurations(values);
  await loadServerConfigurations(true);

  return {
    status: "OK",
  };
});
