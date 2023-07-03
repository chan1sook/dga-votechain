import { getDefaultAdminTopMenus, getDefaultDevTopMenus, getDefaultTopMenus } from "~/src/services/form/preference";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/api/session/get");

  const preferences = {
    topMenu: {
      voter: getDefaultTopMenus(),
      admin: getDefaultAdminTopMenus(),
      dev: getDefaultDevTopMenus(),
    }
  }
  if(data.value) {
    if(data.value.preferences && data.value.preferences.topMenu) {
      if(Array.isArray(data.value.preferences.topMenu.voter)) {
        preferences.topMenu.voter = data.value.preferences.topMenu.voter;
      }
      if(Array.isArray(data.value.preferences.topMenu.admin)) {
        preferences.topMenu.admin = data.value.preferences.topMenu.admin;
      }
      if(Array.isArray(data.value.preferences.topMenu.dev)) {
        preferences.topMenu.dev = data.value.preferences.topMenu.dev;
      }
    }

    useSessionData().value = {
      userid: data.value.userid,
      hasCitizenId: data.value.hasCitizenId,
      permissions: data.value.permissions || [],
      isGovOfficer: data.value.isGovOfficer,
      preferences,
      roleMode: data.value.roleMode,
      firstName: data.value.firstName,
      lastName: data.value.lastName,
      email: data.value.email,
      ministry: data.value.ministry,
      department: data.value.department,
      division: data.value.division,
    };
  } else {
    useSessionData().value = {
      userid: undefined,
      hasCitizenId: undefined,
      permissions: [],
      preferences,
      isGovOfficer: undefined,
      roleMode: "guest",
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      ministry: undefined,
      department: undefined,
      division: undefined,
    };
  }
})
