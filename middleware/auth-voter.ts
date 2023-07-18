export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!useSessionData().value.userid) {
    useAllowRoles().value = ["guest"];
    return navigateTo("/login");
  }
});
