export default defineNuxtRouteMiddleware(async (to, from) => {
  const userData = useSessionData().value;
  if(!userData.userid) {
    return;
  }

  const currentPath = to.path;
  if(currentPath === "/user/edit") {
    return;
  }

  if(!userData.firstName ||
    !userData.lastName ||
    !userData.email ||
    userData.isGovOfficer === undefined || 
    (userData.isGovOfficer === true ? (
      !userData.ministry || !userData.department || !userData.division
    ) : false)
  ) {
    return navigateTo('/user/edit')
  }
})
