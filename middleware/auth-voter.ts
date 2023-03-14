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

  if(!checkPermissionNeeds(usePermissions().value, "access-pages:user")) {
    return navigateTo('/login')
  }
})
