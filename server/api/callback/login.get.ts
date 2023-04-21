import { authorizationCodeDigitalID, getUserInfoDigitalID } from "~~/src/utils/digitalid-protocol";

import EVoteUserModel from "~~/server/models/user"

import { checkPermissionNeeds, checkPermissionSelections, legacyRoleToPermissions } from "~~/src/utils/permissions";
import { USER_SESSION_KEY } from "~~/server/session-handler";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE, public: { DID_API_URL },  } = useRuntimeConfig()
  
  if(typeof code === "string") {
    const { access_token, id_token } = await authorizationCodeDigitalID(code, { DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE });

    const digitalIdUserInfo = await getUserInfoDigitalID(access_token, { DID_API_URL });
    
    let userDoc = await EVoteUserModel.findOne()
      .where("authSources").elemMatch({
        authSource: "digitalId",
        digitalIdUserId: digitalIdUserInfo.user_id
      });

    if(userDoc && checkPermissionSelections(userDoc.permissions, "banned")) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Banned"
      })
    }

    if(userDoc) {
      userDoc.firstName = digitalIdUserInfo.given_name;
      userDoc.lastName = digitalIdUserInfo.family_name;
      userDoc.email = digitalIdUserInfo.email;
      userDoc.citizenId = digitalIdUserInfo.citizen_id;
    } else {
      userDoc = new EVoteUserModel({
        permissions: legacyRoleToPermissions("voter"),
        authSources: [
          { authSource: "digitalId", digitalIdUserId: digitalIdUserInfo.user_id }
        ]
      });
    }

    let defaultRoleMode : UserRole = "voter";
    if(checkPermissionNeeds(userDoc.permissions, "admin-mode")) {
      defaultRoleMode = "admin";
    }

    await userDoc.save();
    await event.context.session.set<UserSessionSavedData>(USER_SESSION_KEY, {
      userid: userDoc._id.toString(),
      roleMode: defaultRoleMode,
      digitalUserIdToken: id_token,
    });

    return sendRedirect(event, "/topics");
  }

  return sendRedirect(event, "/login");
})