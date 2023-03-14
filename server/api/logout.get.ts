export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData) {
    return sendRedirect(event, "/login");
  }

  const { idToken } = userData;

  const { DID_LOGOUT_CALLBACK, public: { DID_API_URL } } = useRuntimeConfig();
  
  const urlParams = new URLSearchParams();
  urlParams.set("id_token_hint", idToken);
  urlParams.set("post_logout_redirect_uri", DID_LOGOUT_CALLBACK);
  const url = new URL(`/connect/endsession?${urlParams}`, DID_API_URL);

  return sendRedirect(event, url.toString())
})