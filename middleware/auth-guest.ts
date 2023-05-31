export default defineNuxtRouteMiddleware(async (to, from) => {
  if(useSessionData().value.userid) {
    return navigateTo('/')
  }
})
