
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
      userid: userData._id.toString(),
      roleMode: userData.roleMode,
      permissions: userData.permissions,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    }
  }
});