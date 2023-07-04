
import bcrypt from "bcrypt";

import { getUserInfoDigitalID } from "~/src/services/vendor/digital-id";
import UserModel from "~/src/models/user"
import { combinePermissions, legacyRoleToPermissions } from "~/src/services/transform/permission";
import { USER_SESSION_KEY } from "~/server/session-handler";
import { getActiveUserByAuthSource, getActiveUserByCitizenID, getActiveUserByEmail }  from "~/src/services/fetch/user";
import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";
import { authorizationThaID } from "~/src/services/vendor/thaid";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  const { THAID_API_KEY, THAID_CLIENT_ID, THAID_CLIENT_SECRET, THAID_LOGIN_CALLBACK, CITIZENID_FIXED_SALT, PREDEFINED_DEV_USERS, public: { DID_API_URL },  } = useRuntimeConfig()

  if(typeof code === "string") {
    const data = await authorizationThaID(code, { THAID_API_KEY, THAID_CLIENT_ID, THAID_CLIENT_SECRET, THAID_LOGIN_CALLBACK });
    console.log(data);
    throw createError({
      statusCode: 501,
      statusMessage: "Not Implemented (Test in production)"
    })
  }

  return sendRedirect(event, "/login");
})