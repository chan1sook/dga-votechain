import { getDefaultAdminTopMenus, getDefaultDevTopMenus, getDefaultTopMenus } from "~/src/services/form/preference";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/api/session/get");

  if(data.value) {
    const preferences = {
      topMenus: getDefaultTopMenus(),
      adminTopMenus: getDefaultAdminTopMenus(),
      devTopMenus: getDefaultDevTopMenus(),
    }
    if(data.value.preferences) {
      if(Array.isArray(data.value.preferences.topMenus)) {
        preferences.topMenus = data.value.preferences.topMenus;
      }

      if(Array.isArray(data.value.preferences.adminTopMenus)) {
        preferences.topMenus = data.value.preferences.adminTopMenus;
      }

      if(Array.isArray(data.value.preferences.devTopMenus)) {
        preferences.topMenus = data.value.preferences.devTopMenus;
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
      preferences: {
        topMenus: getDefaultTopMenus(),
        adminTopMenus: getDefaultAdminTopMenus(),
        devTopMenus: getDefaultDevTopMenus(),
      },
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
