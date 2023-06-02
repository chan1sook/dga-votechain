import UserModel from "~/src/models/user"

export async function getUserByAuthSource(authSource: UserAuthSourceData) {
  const userDoc = await UserModel.findOne({
    authSources: { $elemMatch: authSource }
  })

  return userDoc;
}
export async function getUserByEmail(email?: string) {
  if(!email) {
    return null;
  }
  
  const userDoc = await UserModel.findOne({
    email,
  });

  return userDoc;
}