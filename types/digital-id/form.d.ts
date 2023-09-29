interface DigitalIdAuthorizationCodeParam {
  DID_API_URL: string;
  DID_CLIENT_KEY: string;
  DID_LOGIN_CALLBACK: string;
  DID_VERIFY_CODE: string;
  EXTRA_DATA: LoginExtraParams;
}

interface DigitalIdGetUserInfoParam {
  DID_API_URL: string;
}
