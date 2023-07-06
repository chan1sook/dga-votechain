import { getFastConfiguration, getServerConfigurations } from "~/src/services/fetch/config";
import { configSerializationReplacer } from "~/src/services/formatter/config";
import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  const query = getQuery(event);
  const fields = typeof query.fields === "string" ? JSON.parse(query.fields) : [];

  if(fields.length > 0) {
    const allowProtectedMode = userData && !isBannedUser(userData) && checkPermissionNeeds(userData.permissions, "dev-mode") && userData.roleMode === 'developer';
    const configResponse = getFastConfiguration(fields, allowProtectedMode);
    console.log(configResponse);
    return configResponse;
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: "Required Fields",
    });
  }
});