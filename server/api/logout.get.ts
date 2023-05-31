import { getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export default defineEventHandler(async (event) => {
  const { DID_LOGOUT_CALLBACK, public: { DID_API_URL } } = useRuntimeConfig();
  const userData = event.context.userData;

  if(!userData) {
    return sendRedirect(event, "/login");
  }

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