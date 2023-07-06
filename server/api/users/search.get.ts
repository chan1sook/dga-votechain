import { searchExactActiveUserByKeyword } from "~/src/services/fetch/user";
import { isAdminRole } from "~/src/services/validations/role";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || isBannedUser(userData) || !isAdminRole(userData.roleMode)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const query = getQuery(event);
  
  let user = null;
  const userSearchParam : UserSearchParams = {
    keyword: typeof query.keyword === "string" ? query.keyword : "",
    adminOnly: query.adminOnly === "1",
    excludeUserId: query.notSelf === "1" ? userData._id : undefined,
  }

  user = await searchExactActiveUserByKeyword(userSearchParam);

  if(user) {
    let role : UserRole | undefined;
    let authSources : UserAuthSource[] | undefined = undefined;
    if(userData.roleMode === 'developer' && userData.permissions.includes("dev-mode")) {
      role = user.permissions.includes("dev-mode") ? "developer" :
        (user.permissions.includes("admin-mode") ? "admin" : "voter");
      authSources = [];
      for(const authSource of user.authSources) {
        if(!authSources.includes(authSource.authSource)) {
          authSources.push(authSource.authSource);
        }
      }
    }

    return {
      _id: `${user._id}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      authSources,
      role,
    }

  } else {
    return null;
  }
})