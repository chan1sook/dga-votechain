export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/api/session/get");

  if(data.value) {
    useSessionData().value = {
      sid: data.value.sid,
      userid: data.value.userid,
      permissions: data.value.permissions,
      roleMode: data.value.roleMode,
      digitalIdUserInfo: data.value.digitalIdUserInfo,
    };
  } else {
    useSessionData().value = {
      sid: undefined,
      userid: undefined,
      permissions: [],
      roleMode: undefined,
      digitalIdUserInfo: undefined,
    };
  }
})
