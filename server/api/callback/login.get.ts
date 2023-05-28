
import bcrypt from "bcrypt";

import { authorizationCodeDigitalID, getUserInfoDigitalID } from "~~/src/utils/digitalid-protocol";
import EVoteUserModel from "~~/server/models/user"
import { checkPermissionNeeds, legacyRoleToPermissions } from "~~/src/utils/permissions";
import { USER_SESSION_KEY } from "~~/server/session-handler";
import { getUserByAuthSource, getUserByEmail } from "~~/server/utils";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE, public: { DID_API_URL },  } = useRuntimeConfig()
  
  if(typeof code === "string") {
    const { access_token, id_token } = await authorizationCodeDigitalID(code, { DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE });

    const digitalIdUserInfo = await getUserInfoDigitalID(access_token, { DID_API_URL });
    const hashedCitizenID = bcrypt.hashSync(digitalIdUserInfo.citizen_id, 10);

    const authSource : UserAuthSource = {
      authSource: "digitalId",
      digitalIdUserId: digitalIdUserInfo.user_id
    };
    let userDoc = await getUserByAuthSource(authSource);

    if(userDoc) {
      userDoc.firstName = digitalIdUserInfo.given_name;
      userDoc.lastName = digitalIdUserInfo.family_name;
      userDoc.email = digitalIdUserInfo.email;
      userDoc.hashedCitizenId = hashedCitizenID;
      await userDoc.save();
    } else {
      userDoc = await getUserByEmail(digitalIdUserInfo.email);
      if(!userDoc) {
        userDoc = new EVoteUserModel({
          permissions: legacyRoleToPermissions("voter"),
          authSources: [
            { authSource: "digitalId", digitalIdUserId: digitalIdUserInfo.user_id }
          ],
          firstName: digitalIdUserInfo.given_name,
          lastName: digitalIdUserInfo.family_name,
          email: digitalIdUserInfo.email,
          hashedCitizenId: hashedCitizenID,
        });
        await userDoc.save();
      } else {
        if(!userDoc.hashedCitizenId) {
          userDoc.hashedCitizenId = hashedCitizenID;
        }
        
        userDoc.authSources.push({ authSource: "digitalId", digitalIdUserId: digitalIdUserInfo.user_id });
        userDoc.markModified("authSources");
        await userDoc.save();
      }
    }

    let defaultRoleMode : UserRole = "voter";
    if(checkPermissionNeeds(userDoc.permissions, "admin-mode")) {
      defaultRoleMode = "admin";
    }

    await event.context.session.set<UserSessionSavedData>(USER_SESSION_KEY, {
      userid: userDoc._id.toString(),
      roleMode: defaultRoleMode,
      authFrom: {
        ...authSource,
        digitalUserIdToken: id_token,
      },
    });

    return sendRedirect(event, "/topics");
  }

  return sendRedirect(event, "/login");
})