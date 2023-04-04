
export default defineEventHandler<UserResponseData>(async (event) => {
  const userData = event.context.userData;
  if(!userData) {
    return {
      sid: event.context.session.sid,
      permissions: [],
    }
  } else {
    return {
      sid: event.context.session.sid,
      userid: userData.userid,
      roleMode: userData.roleMode,
      digitalIdUserInfo: userData.digitalIdUserInfo,
      permissions: userData.permissions,
    }
  }
});