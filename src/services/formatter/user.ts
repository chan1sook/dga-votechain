export function getPrettyFullName(params: UserBasicResponseDataWithId) {
  if(params.firstName) {
    return params.lastName ? `${params.firstName} ${params.lastName}` : params.firstName;
  }

  if(params.email) {
    return params.email;
  }
  
  return params._id;
}