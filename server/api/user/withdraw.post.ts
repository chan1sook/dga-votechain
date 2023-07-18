import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import UserModel from "~/src/models/user";
import { isProtectedUser } from "~/src/services/validations/user";
import { USER_SESSION_KEY } from "~/server/session-handler";

dayjs.extend(utc);
dayjs.extend(timezone);

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if (!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const {
    public: { ALLOW_WITHDRAW_USER },
  } = useRuntimeConfig();
  if (!ALLOW_WITHDRAW_USER) {
    throw createError({
      statusCode: 503,
      statusMessage: "Temporary Disabled",
    });
  }

  const userDoc = await UserModel.findById(userData._id);
  if (!userDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Your user id not found",
    });
  }

  if (isProtectedUser(userData)) {
    // Temp Action
    console.warn("[Revoke User] Protected User Can't remove now");
  } else {
    userDoc.removeAt = dayjs()
      .tz("Asia/Bangkok")
      .add(1, "year")
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();
    await userDoc.save();
  }

  // Logout action
  const { DID_LOGOUT_CALLBACK, DID_API_URL } = useRuntimeConfig();

  if (
    userData.authFrom.authSource === "digitalId" &&
    userData.authFrom.userToken
  ) {
    const urlParams = new URLSearchParams();
    urlParams.append("id_token_hint", userData.authFrom.userToken);
    urlParams.append("post_logout_redirect_uri", DID_LOGOUT_CALLBACK);
    const url = new URL(`/connect/endsession?${urlParams}`, DID_API_URL);
    return sendRedirect(event, url.toString());
  }

  await event.context.session.unset(USER_SESSION_KEY);
  delete event.context.userData;
  return sendRedirect(event, "/login");
});
