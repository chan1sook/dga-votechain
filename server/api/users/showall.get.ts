import UserModel from "~/src/models/user"
import { isUserAdmin, isUserDeveloper } from "~/src/services/validations/role";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || isBannedUser(userData) || !isUserDeveloper(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const userDocs = await UserModel.find({ removed: { $ne: true }});

  const users : UserSearchResponseData[] = userDocs.map((data) => {
    const role : UserRole = isUserDeveloper(data) ? "developer" : (isUserAdmin(data) ? "admin" : "voter");
    const authSources : UserAuthSource[] = [];
    for(const authSource of data.authSources) {
      if(!authSources.includes(authSource.authSource)) {
        authSources.push(authSource.authSource);
      }
    }
    return {
      _id: `${data._id}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      authSources: authSources,
      role,
    }
  });

  return users;
})