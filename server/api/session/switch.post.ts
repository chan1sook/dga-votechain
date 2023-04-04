import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const { newMode } : { newMode: UserRole } = await readBody(event);
  if(newMode === "voter" && !checkPermissionNeeds(userData.permissions, "access-pages:user")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  } else if(newMode === "admin" && !checkPermissionNeeds(userData.permissions, "access-pages:admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  } else if(newMode === "developer" && !checkPermissionNeeds(userData.permissions, "access-pages:developer")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  userData.roleMode = newMode;

  await event.context.session.set<UserSessionStorageData>("userData", {
    userid: userData.userid,
    accessToken: userData.accessToken,
    idToken: userData.idToken,
    roleMode: newMode,
  });

  return { resopse: "OK", newMode };
});