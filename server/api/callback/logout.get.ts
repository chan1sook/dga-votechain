export default defineEventHandler(async (event) => {
  await event.context.session.unset("userData");
  delete event.context.userData;
  
  return sendRedirect(event, "/");
})