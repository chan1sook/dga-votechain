import crypto from "crypto"
import { getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getActiveUserByAuthSource, getActiveUserByEmail }  from "~/src/services/fetch/user";
import { legacyRoleToPermissions } from "~/src/services/transform/permission";
import UserModel from "~/src/models/user"
import { USER_SESSION_KEY } from "../session-handler";
import { checkPermissionNeeds } from "~/src/services/validations/permission";

export default defineEventHandler(async (event) => {
  const param = await readBody(event);
  
  if(param.source === "digitalId") {
    const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE, public: { DID_API_URL } } = useRuntimeConfig();

    const urlParams = new URLSearchParams();
    urlParams.set("response_type", "code");
    urlParams.set("client_id", DID_CLIENT_KEY);
    urlParams.set("redirect_uri", DID_LOGIN_CALLBACK);
  
    const scopes : DigitalIdScope[] = [
      "openid", "email", "user_id", "citizen_id", "given_name", "email", "middle_name","family_name"
    ];
  
    urlParams.set("scope", scopes.join(" "));
    urlParams.set("code_challenge_method", "S256");
  
    const hash = crypto.createHash("sha256").update(DID_VERIFY_CODE).digest();
    const challengeCode = hash.toString("base64url");
    
    urlParams.set("code_challenge", challengeCode);
    
    const url = new URL(`/connect/authorize?${urlParams}`, DID_API_URL);
  
    return sendRedirect(event, url.toString())
  } else if(param.source === "firebase") {
    const decodedFirebaseUserdata = await getAuth(getApp()).verifyIdToken(`${param.token}`, true).catch((err) => {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Token'
      })
    })
    const authSource: UserAuthSourceData = {
      authSource: "firebase",
      firebaseUid: decodedFirebaseUserdata.uid,
    };

    let userDoc = await getActiveUserByAuthSource(authSource);
    if(userDoc) {
      if(!userDoc.email) {
        userDoc.email = decodedFirebaseUserdata.email;
        await userDoc.save();
      }
    } else {
      userDoc = await getActiveUserByEmail(decodedFirebaseUserdata.email);
      if(!userDoc) {
        userDoc = new UserModel({
          permissions: legacyRoleToPermissions("admin"),
          authSources: [
            { authSource: "firebase", firebaseUid: decodedFirebaseUserdata.uid }
          ],
          email: decodedFirebaseUserdata.email,
        });
        await userDoc.save();
      } else {
        userDoc.authSources.push({ authSource: "firebase", firebaseUid: decodedFirebaseUserdata.uid });
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
        userToken: param.token?.toString(),
      },
    });

    return sendRedirect(event, "/topics");
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid Login Methods'
  })
})