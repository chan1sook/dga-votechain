type ThaIDUserId = string;


type ThaIDScope =
  "pid" |
  "th_fname" |
  "th_lname" |
  "th_mname" |
  "address" |
  "dob";

interface ThaIDAuthResponse {
  access_token: string,
  refresh_token: string,
  expires_in: number,
  token_type: string,
  scope: string,
  pid: string,
  th_fname: string,
  th_lname: string,
}