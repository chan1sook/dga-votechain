
type RequestPermissionsResponseData = Omit<RequestPermissionsModelData,  "_id" | "createdAt" | "updatedAt" | "digitalIdUserInfo"> & {
  _id: string,
}
  
type RequestPermissionsListData = RequestPermissionsResponseData & {
  personalData: {
    firstName?: string,
    lastName?: string,
    email?: string,
  }
};