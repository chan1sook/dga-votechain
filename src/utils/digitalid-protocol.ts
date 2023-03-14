import axios from "axios";

export async function authorizationCodeDigitalID(code: string, { DID_API_URL, DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_VERIFY_CODE }: DigitalIDAuthorizationCodeParam) {
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

  return data as DigitalIDAuthResponse;
}

export async function getUserInfoDigitalID(accessToken: string, { DID_API_URL } : DigitalIDGetUserInfoParam) {
  const url = new URL("/connect/userinfo", DID_API_URL);

  const { data } = await axios.get(url.toString(), {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
  });

  // console.log(data);

  return data as DigitalIDUserDataResponse;
}