import { isUserDeveloper } from "~/src/services/validations/role";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if(useSessionData().value.roleMode !== 'developer') {
    if(isUserDeveloper(useSessionData().value)) {
      useSessionData().value.roleMode = "developer";
      useAllowRoles().value = ["developer"];
    } else {    
      return showError({ statusCode: 404, statusMessage: "Page Not Found" });
    }
  }
})
