import axios from "axios";
import crypto from "crypto";

export const THAID_STATE = crypto.randomBytes(24).toString("hex");


export function generatThaIDLoginUrl({ THAID_CLIENT_ID, THAID_LOGIN_CALLBACK }: ThaIDAuthorizationCodeParam) {
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
  return url.toString();
}


export async function authorizationThaID(code: string, { THAID_API_KEY, THAID_CLIENT_ID, THAID_CLIENT_SECRET, THAID_LOGIN_CALLBACK }: ThaIDAuthorizationCodeParam) {
  const urlParams = new URLSearchParams();
  urlParams.set("grant_type", "authorization_code");
  urlParams.set("code", code);
  urlParams.set("redirect_uri", THAID_LOGIN_CALLBACK);

  const url = "https://imauth.bora.dopa.go.th/api/v1/oauth2/token/";
  
  const authBasic = "Basic " + Buffer.from(THAID_CLIENT_ID + ":" + THAID_CLIENT_SECRET).toString("base64");
  
  const { data } = await axios.post(url, urlParams, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-imauth-apikey": THAID_API_KEY,
      "Authorization": authBasic,
    },
  })
  return data as ThaIDAuthResponse;
}
