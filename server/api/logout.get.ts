export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData) {
    return sendRedirect(event, "/login");
  }

  return sendRedirect(event, "/api/callback/logout");
})