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

export function formatCreatedByName(createdBy?: UserBasicResponseDataWithId) {
  if(createdBy && createdBy.firstName) {
    return createdBy.lastName ? `${createdBy.firstName} ${createdBy.lastName}` : createdBy.firstName;
  }

  if(createdBy && createdBy.email) {
    return createdBy.email;
  }
  

  if(createdBy && createdBy._id) {
    return createdBy._id;
  }

  return "-";
}