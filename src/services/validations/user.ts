import { checkPermissionNeeds } from "./permission";

export function splitBasicName(str: string) {
  const nameSpliter = str.split(" ", 3);
  return nameSpliter;
}

export function compareAuthSourceFn(
  search: UserAuthSourceData,
  target: UserAuthSourceData
) {
  const _search: UserAuthSourceData = {
    authSource: search.authSource,
    digitalIdUserId: search.digitalIdUserId,
    thaIDUserId: search.thaIDUserId,
  };

  const _target: UserAuthSourceData = {
    authSource: target.authSource,
    digitalIdUserId: target.digitalIdUserId,
    thaIDUserId: target.thaIDUserId,
  };

  return JSON.stringify(_search) === JSON.stringify(_target);
}

export function isThaiCitizenId(str: string) {
  if (!/^[1-8][0-9]{12}$/.test(str)) {
    return false;
  }

  let sumDigits = 0;
  for (let i = 0; i < 12; i += 1) {
    sumDigits += parseInt(str[i], 10) * (13 - i);
  }
  const sumDigitValue = (11 - (sumDigits % 11)) % 10;
  const checkshum = parseInt(str.charAt(12), 10);

  return sumDigitValue === checkshum;
}

export function isBannedUser(user: Pick<UserSessionData, "bannedUntil">) {
  return !!user.bannedUntil;
}

export function isProtectedUser(user: Pick<UserSessionData, "permissions">) {
  return checkPermissionNeeds(user.permissions, "dev-mode");
}

export function voterCountOf(
  voters: VoterAllowFormData[],
  user: VoterAllowFormData
) {
  return voters.reduce((prev, current) => {
    if (user.userid && current.userid === user.userid) {
      return prev + 1;
    }
    return prev;
  }, 0);
}
