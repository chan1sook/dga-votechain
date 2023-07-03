import axios from "axios";
import crypto from "crypto";

export const DID_VERIFY_CODE = crypto.randomBytes(24).toString("hex");

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