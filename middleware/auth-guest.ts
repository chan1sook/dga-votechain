import { checkPermissionSelections } from "~~/src/utils/permissions";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/api/session");

  if(data.value) {
    useUserId().value = data.value.userid;
    usePermissions().value = data.value.permissions;
  } else {
    useUserId().value = undefined;
    usePermissions().value = [];
  }

  if(checkPermissionSelections(usePermissions().value, "access-pages:user", "access-pages:admin", "access-pages:developer")) {
    return navigateTo('/')
  }
})
