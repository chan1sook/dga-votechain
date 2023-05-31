export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/api/session/get");

  if(data.value) {
    useSessionData().value = {
      userid: data.value.userid,
      hasCitizenId: data.value.hasCitizenId,
      permissions: data.value.permissions || [],
      isGovOfficer: data.value.isGovOfficer,
      preferences: data.value.preferences,
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
        topMenus: [],
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
