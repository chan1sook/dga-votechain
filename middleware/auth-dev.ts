import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/api/session/get");

  if(data.value) {
    useSessionData().value = {
      sid: data.value.sid,
      userid: data.value.userid,
      permissions: data.value.permissions,
      roleMode: data.value.roleMode,
      firstName: data.value.firstName,
      lastName: data.value.lastName,
      email: data.value.email,
    };
  } else {
    useSessionData().value = {
      sid: undefined,
      userid: undefined,
      permissions: [],
      roleMode: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
    };
  }

  const isDevPermissions = checkPermissionNeeds(useSessionData().value.permissions, "access-pages:developer");
    
  if(!isDevPermissions) {
    const isUserPermissions = checkPermissionNeeds(useSessionData().value.permissions, "access-pages:user");
    
    if(!isUserPermissions) {
      return navigateTo('/login')
    } else {
      return showError({ statusCode: 404, statusMessage: "Page Not Found" });
    }
  }
})
