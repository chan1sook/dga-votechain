import axios from "axios";
import crypto from "crypto";

export const DID_VERIFY_CODE = crypto.randomBytes(24).toString("hex");

export function generateDigitalIDLoginUrl({ DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE }: DigitalIdAuthorizationCodeParam) {
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

  return url.toString();
}

export function generateDigitalIDRegisterUrl({ DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE }: DigitalIdAuthorizationCodeParam) {
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
  
  const returnURL = `/connect/authorize/callback?${urlParams}`;

  const actualUrlParams = new URLSearchParams();
  actualUrlParams.set("ReturnUrl", returnURL);
  console.log("params", actualUrlParams.toString());

  const url = new URL(`/Account/Register?${actualUrlParams}`, DID_API_URL);

  return url.toString();
}

export async function authorizationCodeDigitalID(code: string, { DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE }: DigitalIdAuthorizationCodeParam) {
  const urlParams = new URLSearchParams();
  urlParams.set("grant_type", "authorization_code");
  urlParams.set("code", code);
  urlParams.set("redirect_uri", DID_LOGIN_CALLBACK);
  urlParams.set("code_verifier", DID_VERIFY_CODE);
  urlParams.set("client_id", DID_CLIENT_KEY);

  const url = new URL("/connect/token", DID_API_URL);

  const { data } = await axios.post(url.toString(), urlParams, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
  });

  return data as DigitalIdAuthResponse;
}

export async function getUserInfoDigitalID(accessToken: string, { DID_API_URL } : DigitalIdGetUserInfoParam) {
  const url = new URL("/connect/userinfo", DID_API_URL);

  const { data } = await axios.get(url.toString(), {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
  });

  return data as DigitalIdUserDataResponse;
}