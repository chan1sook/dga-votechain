import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/api/session");

  if(data.value) {
    useUserId().value = data.value.userid;
    usePermissions().value = data.value.permissions;
  } else {
    useUserId().value = undefined;
    usePermissions().value = [];
  }

  const isAdminPermissions = checkPermissionNeeds(usePermissions().value, "access-pages:admin");
  
  if(!isAdminPermissions) {
    const isUserPermissions = checkPermissionNeeds(usePermissions().value, "access-pages:user");
    
    if(!isUserPermissions) {
      return navigateTo('/login')
    } else {
      return showError({ statusCode: 404, statusMessage: "Page Not Found" });
    }
  }
})
