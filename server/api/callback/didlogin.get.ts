
import bcrypt from "bcrypt";

import { authorizationCodeDigitalID, DID_VERIFY_CODE, getUserInfoDigitalID } from "~/src/services/vendor/digital-id";
import UserModel from "~/src/models/user"
import { combinePermissions, legacyRoleToPermissions } from "~/src/services/transform/permission";
import { USER_SESSION_KEY } from "~/server/session-handler";
import { getActiveUserByAuthSource, getActiveUserByCitizenID }  from "~/src/services/fetch/user";
import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, CITIZENID_FIXED_SALT, PREDEFINED_DEV_USERS, public: { DID_API_URL },  } = useRuntimeConfig()

  if(typeof code === "string") {
    const { access_token, id_token } = await authorizationCodeDigitalID(code, { DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE: DID_VERIFY_CODE });

    const digitalIdUserInfo = await getUserInfoDigitalID(access_token, { DID_API_URL });

    const authSource : UserAuthSourceData = {
      authSource: "digitalId",
      digitalIdUserId: digitalIdUserInfo.user_id
    };
    let userDoc = await getActiveUserByAuthSource(authSource);

    if(!userDoc) {
      userDoc = await getActiveUserByCitizenID(digitalIdUserInfo.citizen_id);
    }

    if(!userDoc) {
      userDoc = new UserModel({
        permissions: legacyRoleToPermissions("admin"),
        authSources: [authSource],
        firstName: digitalIdUserInfo.given_name,
        lastName: digitalIdUserInfo.family_name,
        email: digitalIdUserInfo.email,
      });
    }

    if(userDoc) {
      if(!userDoc.authSources.find((ele) => {
        const search : Record<string, any> = { ...ele };
        delete search._id;
        
        JSON.stringify(ele) === JSON.stringify(authSource);
      })) {
        userDoc.authSources.push(authSource);
      }
      
      // auto apply some
      if(!userDoc.firstName) {
        userDoc.firstName = digitalIdUserInfo.given_name;
      }

      if(!userDoc.lastName) {
        userDoc.lastName = digitalIdUserInfo.family_name;
      }

      if(!userDoc.email) {
        userDoc.email = digitalIdUserInfo.email;
      }
      
      if(!userDoc.cidHashed) {
        const cidHashed = await bcrypt.hash(digitalIdUserInfo.citizen_id, CITIZENID_FIXED_SALT);
        userDoc.cidHashed = cidHashed;
      }

      // Predefine dev at login
      if(PREDEFINED_DEV_USERS.includes(digitalIdUserInfo.user_id)) {
        userDoc.permissions = combinePermissions(userDoc.permissions, ...legacyRoleToPermissions("developer"));
      }

      await userDoc.save();
    }

    let defaultRoleMode : UserRole = "voter";
    if(isBannedUser(userDoc)) {
      defaultRoleMode = "guest";
    } else if(checkPermissionNeeds(userDoc.permissions, "admin-mode")) {
      defaultRoleMode = "admin";
    }

    await event.context.session.set<UserSessionSavedData>(USER_SESSION_KEY, {
      userid: userDoc._id.toString(),
      roleMode: defaultRoleMode,
      authFrom: {
        ...authSource,
        userToken: id_token,
      },
    });

    return sendRedirect(event, "/topics");
  }

  return sendRedirect(event, "/login");
})