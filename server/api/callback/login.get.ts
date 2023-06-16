
import bcrypt from "bcrypt";

import { authorizationCodeDigitalID, getUserInfoDigitalID } from "~/src/services/fetch/digital-id";
import UserModel from "~/src/models/user"
import { legacyRoleToPermissions } from "~/src/services/transform/permission";
import { USER_SESSION_KEY } from "~/server/session-handler";
import { getActiveUserByAuthSource, getActiveUserByEmail } from "~/src/services/fetch/user";
import { checkPermissionNeeds } from "~/src/services/validations/permission";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE, BCRYPT_SALT_ROUND, public: { DID_API_URL },  } = useRuntimeConfig()
  
  if(typeof code === "string") {
    const { access_token, id_token } = await authorizationCodeDigitalID(code, { DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE });

    const digitalIdUserInfo = await getUserInfoDigitalID(access_token, { DID_API_URL });

    const authSource : UserAuthSourceData = {
      authSource: "digitalId",
      digitalIdUserId: digitalIdUserInfo.user_id
    };
    let userDoc = await getActiveUserByAuthSource(authSource);

    if(userDoc) {
      if(!userDoc.firstName) {
        userDoc.firstName = digitalIdUserInfo.given_name;
      }
      if(!userDoc.lastName) {
        userDoc.lastName = digitalIdUserInfo.family_name;
      }
      if(!userDoc.email) {
        userDoc.email = digitalIdUserInfo.email;
      }
      if(!userDoc.hashedCitizenId) {
        const hashedCitizenID = bcrypt.hashSync(digitalIdUserInfo.citizen_id, BCRYPT_SALT_ROUND);
        userDoc.hashedCitizenId = hashedCitizenID;
      }
      await userDoc.save();
    } else {
      userDoc = await getActiveUserByEmail(digitalIdUserInfo.email);
      if(!userDoc) {
        const hashedCitizenID = bcrypt.hashSync(digitalIdUserInfo.citizen_id, BCRYPT_SALT_ROUND);
        
        userDoc = new UserModel({
          permissions: legacyRoleToPermissions("admin"),
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
          const hashedCitizenID = bcrypt.hashSync(digitalIdUserInfo.citizen_id, BCRYPT_SALT_ROUND);
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
        userToken: id_token,
      },
    });

    return sendRedirect(event, "/topics");
  }

  return sendRedirect(event, "/login");
})