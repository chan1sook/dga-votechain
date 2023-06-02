export function getPrettyFullName(params: UserBasicData & { _id?: string}) {
  if(params.firstName) {
    return params.lastName ? `${params.firstName} ${params.lastName}` : params.firstName;
  }

  if(params.email) {
    return params.email;
  }
  
  if(typeof params._id === "string") {
    return params._id;
  }

  return "";
}