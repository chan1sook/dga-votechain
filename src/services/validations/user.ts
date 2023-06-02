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

export function voterCountOf(voters: VoterAllowFormData[], user: VoterAllowFormData) {
  return voters.reduce((prev, current) => {
    if(user.userid && current.userid === user.userid) {
      return prev + 1;
    }
    return prev;
  }, 0);
}
