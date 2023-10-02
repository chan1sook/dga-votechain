export function getAfterRedirectUrlbyParam(
  EXTRA_DATA: LoginExtraParams
): string {
  if (EXTRA_DATA.cbtid) {
    return `/vote/${EXTRA_DATA.cbtid}`;
  }

  return "/topics";
}
