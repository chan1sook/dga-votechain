type DigitalIDUserId = string;
type DigitalIDScope =
  "openid" |
  "phone" |
  "profile" |
  "user_id" |
  "citizen_id" |
  "citizen_id_verified" |
  "passport_id" |
  "passport_id_verified" |
  "juristic_name" |
  "juristic_id" |
  "juristic_id_verified" |
  "juristic_name_verified" |
  "email" |
  "email_verified" |
  "ial_level" |
  "personal_token" |
  "given_name" |
  "family_name" |
  "middle_name" |
  "phone_number" |
  "phone_number_verified" |
  "preferred_username" |
  "require_email" |
  "require_mobile" |
  "require_ial_level" |
  "given_name_verified" |
  "middle_name_verified" |
  "family_name_verified" |
  "name" |
  "name_verified" |
  "email_require" |
  "mobile_require" |
  "ial_level_require" |
  "roles" |
  "offline_access";

interface DigitalIDAuthorizationCodeParam {
  DID_API_URL: string,
  DID_CLIENT_KEY: string,
  DID_LOGIN_CALLBACK: string,
  DID_VERIFY_CODE: string,
}

interface DigitalIDGetUserInfoParam {
  DID_API_URL: string,
}

interface DigitalIDAuthResponse {
  id_token: string,
  access_token: string,
  expires_in: number,
  token_type: string,
  scope: string,
}

type DigitalIDUserDataResponse = {
  user_id: DigitalIDUserId,
  citizen_id: string,
  given_name: string,
  middle_name: string,
  family_name: string,
  email: string,
  amr: string,
  sub: string,
};