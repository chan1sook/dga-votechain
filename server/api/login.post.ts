import crypto from "crypto"

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
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid Login Methods'
  })
})