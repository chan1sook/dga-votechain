import crypto from "crypto"
import { DID_VERIFY_CODE } from "~/src/services/vendor/digital-id";
import { THAID_STATE } from "~/src/services/fetch/thaid";

export default defineEventHandler(async (event) => {
  const param = await readBody(event);
  
  if(param.source === "digitalId") {
    const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, public: { DID_API_URL } } = useRuntimeConfig();

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
  } else if(param.source === "thaID") {
    const { THAID_API_KEY, THAID_CLIENT_ID, THAID_CLIENT_SECRET, THAID_LOGIN_CALLBACK } = useRuntimeConfig();

    const urlParams = new URLSearchParams();
    urlParams.set("response_type", "code");
    urlParams.set("state", THAID_STATE);
    urlParams.set("client_id", THAID_CLIENT_ID);
    urlParams.set("redirect_uri", THAID_LOGIN_CALLBACK);

    const scopes : ThaIDScope[] = [
      "pid", "th_fname", "th_lname", "th_mname" 
    ];
  
    urlParams.set("scope", scopes.join(" "));

    const url = new URL(`/api/v1/oauth2/auth/?${urlParams}`, "https://imauth.bora.dopa.go.th");
    
    setHeader(event, "Content-type", "application/x-www-form-urlencoded");
    setHeader(event, "x-imauth-apikey", THAID_API_KEY);
    const authBasic = "Basic " + Buffer.from(THAID_CLIENT_ID + ":" + THAID_CLIENT_SECRET).toString("base64url");
    setHeader(event, "Authorization", authBasic);

    return sendRedirect(event, url.toString())
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid Login Methods'
  })
})