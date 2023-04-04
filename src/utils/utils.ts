export const webAppName : string = "DGA E-Votechain";

export function toFirstCapitalState(state: string) {
  const leader = state.charAt(0).toUpperCase()
  const sub = state.substring(1).toLowerCase()
  return leader + sub;
}

export function goBack() {
  useRouter().go(-1);
}

export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isThaiCitizenId(str: string) {
  if(!/^[1-8][0-9]{12}$/.test(str)) {
    return false;
  }

  let sumDigits = 0;
  for(let i = 0; i < 12; i += 1) {
    sumDigits += parseInt(str[i], 10) * (13 - i);
  }
  const sumDigitValue = (11 - sumDigits % 11) % 10;
  const checkshum = parseInt(str.charAt(12), 10);
  
  return sumDigitValue === checkshum;
}
