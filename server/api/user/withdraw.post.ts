import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import UserModel from "~/src/models/user"
import { getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { isProtectedUser } from "~/src/services/validations/user";

dayjs.extend(utc);
dayjs.extend(timezone);

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const userDoc = await UserModel.findById(userData._id);
  if(!userDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Your user id not found",
    });
  }

  if(isProtectedUser(userData)) {
    // Temp Action
    console.warn("[Revoke User] Protected User Can't remove now");
  } else {
    userDoc.removeAt = dayjs().tz("Asia/Bangkok").add(1, "year").hour(0).minute(0).second(0).millisecond(0).toDate();
    await userDoc.save();
  }

  // Logout action
  const { DID_LOGOUT_CALLBACK, public: { DID_API_URL } } = useRuntimeConfig();

  if(userData.authFrom.authSource === 'digitalId' && userData.authFrom.userToken) {
    const urlParams = new URLSearchParams();
    urlParams.append("id_token_hint", userData.authFrom.userToken);
    urlParams.append("post_logout_redirect_uri", DID_LOGOUT_CALLBACK);
    const url = new URL(`/connect/endsession?${urlParams}`, DID_API_URL);
    return sendRedirect(event, url.toString());
  }

  if(userData.authFrom.authSource === 'firebase' && userData.authFrom.firebaseUid) {
    await getAuth(getApp()).revokeRefreshTokens(userData.authFrom.firebaseUid);
    return sendRedirect(event, "/api/callback/logout");
  }

  return sendRedirect(event, "/api/callback/logout");
})