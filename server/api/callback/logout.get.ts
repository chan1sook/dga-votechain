import { USER_SESSION_KEY } from "~/server/session-handler";

export default defineEventHandler(async (event) => {
  await event.context.session.unset(USER_SESSION_KEY);
  delete event.context.userData;
  
  return sendRedirect(event, "/");
})