export function getAfterRedirectUrlbyParam(
  EXTRA_DATA: LoginExtraParams
): string {
  if (EXTRA_DATA.cbtid) {
    return `/vote/${EXTRA_DATA.cbtid}`;
  }

  return "/topics";
}

export function encodeLoginState(EXTRA_DATA: LoginExtraParams): string {
  let state = "";
  if (EXTRA_DATA.cbtid) {
    state += EXTRA_DATA.cbtid;
  }

  return state;
}

export function decodeLoginState(state: string | undefined): LoginExtraParams {
  const tokens = (state || "").split(".");
  const result: LoginExtraParams = {};
  result.cbtid = tokens[0];

  return result;
}
