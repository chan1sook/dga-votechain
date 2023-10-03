import {
  getDefaultAdminTopMenus,
  getDefaultDevTopMenus,
  getDefaultTopMenus,
  getDefaultVoterTopMenus,
} from "~/src/services/form/preference";
import {
  isUserAdmin,
  isUserDeveloper,
  isUserVoter,
} from "~/src/services/validations/role";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/api/session/get");

  const preferences = {
    topMenu: getDefaultTopMenus(),
  };

  if (data.value) {
    if (data.value.preferences) {
      if (Array.isArray(data.value.preferences.topMenu)) {
        preferences.topMenu = data.value.preferences.topMenu;
      } else if (data.value.permissions) {
        if (isUserDeveloper({ permissions: data.value.permissions })) {
          preferences.topMenu = getDefaultDevTopMenus();
        } else if (isUserAdmin({ permissions: data.value.permissions })) {
          preferences.topMenu = getDefaultAdminTopMenus();
        } else if (isUserVoter({ permissions: data.value.permissions })) {
          preferences.topMenu = getDefaultVoterTopMenus();
        }
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
});
