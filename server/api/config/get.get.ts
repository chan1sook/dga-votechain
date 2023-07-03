import { getConfigurations } from "~/src/services/fetch/config";
import { configSerializationReplacer } from "~/src/services/formatter/config";
import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  const query = getQuery(event);
  if(Array.isArray(query.fields) && query.fields.length > 0) {
    const fields = query.fields.map((ele) => `${ele}`);
    const allowProtectedMode = userData && !isBannedUser(userData) && checkPermissionNeeds(userData.permissions, "dev-mode") && userData.roleMode === 'developer';
    const configs = await getConfigurations(fields, allowProtectedMode);
    const configResponse : Record<string, any> = {};
    for(const config of configs) {
      let value = config.value; 
      configResponse[config.key] = configSerializationReplacer(value);
    }
    return configResponse;
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: "Required Fields",
    });
  }
});