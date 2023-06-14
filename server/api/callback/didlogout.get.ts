export default defineEventHandler(async (event) => {
  return sendRedirect(event, "/api/callback/logout");
})