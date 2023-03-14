import { authorizationCodeDigitalID, getUserInfoDigitalID } from "~~/src/utils/digitalid-protocol";

import UserModel from "~~/src/models/user"
import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE, public: { DID_API_URL },  } = useRuntimeConfig()
  
  if(typeof code === "string") {
    const { id_token, access_token } = await authorizationCodeDigitalID(code, { DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE });
    const digitalIdUserInfo = await getUserInfoDigitalID(access_token, { DID_API_URL });
    
    const { permissions, createdAt, updatedAt } = await UserModel.ensureUserData(digitalIdUserInfo.user_id);

    if(checkPermissionNeeds(permissions, "banned")) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Banned"
      })
    }

    event.context.userData = {
      userid: digitalIdUserInfo.user_id,
      idToken: id_token,
      accessToken: access_token,
      digitalIdUserInfo,
      permissions,
      createdAt,
      updatedAt,
    };

    await event.context.session.set<UserSessionStorageData>("userData", {
      userid: digitalIdUserInfo.user_id,
      accessToken: access_token,
      idToken: id_token,
    });

    return sendRedirect(event, "/");
  }

  return sendRedirect(event, "/login");
})