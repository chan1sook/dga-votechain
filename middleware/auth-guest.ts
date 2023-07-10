export default defineNuxtRouteMiddleware(async (to, from) => {
  if(useSessionData().value.userid) {
    useAllowRoles().value = ["voter", "admin", "developer"];
    return navigateTo('/')
  }
})
