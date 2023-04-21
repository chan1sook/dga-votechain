export default defineEventHandler(async (event) => {
  const { DID_LOGOUT_CALLBACK, public: { DID_API_URL} } = useRuntimeConfig();
  const userData = event.context.userData;

  if(!userData) {
    return sendRedirect(event, "/login");
  }

  if(userData?.digitalUserIdToken) {
    const urlParams = new URLSearchParams();
    urlParams.append("id_token_hint", userData.digitalUserIdToken);
    urlParams.append("post_logout_redirect_uri", DID_LOGOUT_CALLBACK);
    const url = new URL(`/connect/endsession?${urlParams}`, DID_API_URL);
    return sendRedirect(event, url.toString());
  }

  return sendRedirect(event, "/api/callback/logout");
})