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

  if(useSessionData().value.roleMode !== "admin" && useSessionData().value.roleMode !== "developer") {
    return showError({ statusCode: 404, statusMessage: "Page Not Found" });
  }
})
