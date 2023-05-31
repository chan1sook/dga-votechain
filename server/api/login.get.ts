import crypto from "crypto"
import { getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getUserByAuthSource } from "../utils";
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { USER_SESSION_KEY } from "../session-handler";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  if(query.source === "digitalId") {
    const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE, public: { DID_API_URL } } = useRuntimeConfig();
  
    const urlParams = new URLSearchParams();
    urlParams.set("response_type", "code");
    urlParams.set("client_id", DID_CLIENT_KEY);
    urlParams.set("redirect_uri", DID_LOGIN_CALLBACK);
  
    const scopes : Array<DigitalIDScope> = [
      "openid", "email", "user_id", "citizen_id", "given_name", "email", "middle_name","family_name"
    ];
  
    urlParams.set("scope", scopes.join(" "));
    urlParams.set("code_challenge_method", "S256");
  
    const hash = crypto.createHash("sha256").update(DID_VERIFY_CODE).digest();
    const challengeCode = hash.toString("base64url");
    
    urlParams.set("code_challenge", challengeCode);
    
    const url = new URL(`/connect/authorize?${urlParams}`, DID_API_URL);
  
    return sendRedirect(event, url.toString())
  } else if(query.source === "firebase") {
    const decodedFirebaseUserdata = await getAuth(getApp()).verifyIdToken(`${query.token}`, true).catch((err) => {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Token'
      })
    })
    const authSource: UserAuthSourceData = {
      authSource: "firebase",
      firebaseUid: decodedFirebaseUserdata.uid,
    };

    const userDoc = await getUserByAuthSource(authSource);
    if(userDoc) {
      if(!userDoc.firstName || !userDoc.lastName) {
        return sendRedirect(event, `/register/firebase?token=${query.token}`);
      }

      let defaultRoleMode : UserRole = "voter";
      if(checkPermissionNeeds(userDoc.permissions, "admin-mode")) {
        defaultRoleMode = "admin";
      }
      
      if(!userDoc.email) {
        userDoc.email = decodedFirebaseUserdata.email;
        await userDoc.save();
      }

      await event.context.session.set<UserSessionSavedData>(USER_SESSION_KEY, {
        userid: userDoc._id.toString(),
        roleMode: defaultRoleMode,
        authFrom: authSource,
      });
      return sendRedirect(event, "/topics");
    } else {
      return sendRedirect(event, `/register/firebase?token=${query.token}`);
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid Login Methods'
  })
})