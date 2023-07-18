import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { USER_SESSION_KEY } from "~/server/session-handler";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if (!userData || isBannedUser(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const { newMode }: { newMode: UserRole } = await readBody(event);
  if (
    newMode === "voter" &&
    !checkPermissionNeeds(userData.permissions, "voter-mode")
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  } else if (
    newMode === "admin" &&
    !checkPermissionNeeds(userData.permissions, "admin-mode")
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  } else if (
    newMode === "developer" &&
    !checkPermissionNeeds(userData.permissions, "dev-mode")
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  userData.roleMode = newMode;

  await event.context.session.set<UserSessionSavedData>(USER_SESSION_KEY, {
    userid: userData._id.toString(),
    roleMode: newMode,
    authFrom: userData.authFrom,
  });

  return { resopse: "OK", newMode };
});
