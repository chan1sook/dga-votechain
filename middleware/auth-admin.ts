export default defineNuxtRouteMiddleware(async (to, from) => {
  if(useSessionData().value.roleMode !== "admin" && useSessionData().value.roleMode !== "developer") {
    return showError({ statusCode: 404, statusMessage: "Page Not Found" });
  }
})
