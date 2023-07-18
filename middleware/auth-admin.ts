import { isUserAdmin } from "~/src/services/validations/role";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (useSessionData().value.roleMode !== "admin") {
    if (isUserAdmin(useSessionData().value)) {
      useSessionData().value.roleMode = "admin";
      useAllowRoles().value = ["admin"];
    } else {
      return showError({ statusCode: 404, statusMessage: "Page Not Found" });
    }
  }
});
