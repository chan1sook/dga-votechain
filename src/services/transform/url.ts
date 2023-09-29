export function getAfterRedirectUrlbyParam(
  EXTRA_DATA: LoginExtraParams
): string {
  if (EXTRA_DATA.voteCallbackId) {
    return `/vote/${EXTRA_DATA.voteCallbackId}`;
  }

  return "/topics";
}
