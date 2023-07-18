import { getFastConfiguration } from "~/src/services/fetch/config";
import { isUserDeveloper } from "~/src/services/validations/role";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  const query = getQuery(event);
  const fields =
    typeof query.fields === "string" ? JSON.parse(query.fields) : [];

  if (fields.length > 0) {
    const allowProtectedMode =
      userData && !isBannedUser(userData) && isUserDeveloper(userData);
    const configResponse = getFastConfiguration(fields, allowProtectedMode);
    return configResponse;
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: "Required Fields",
    });
  }
});
