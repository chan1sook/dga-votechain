
export default defineEventHandler<UserResponseData>(async (event) => {
  const userData = event.context.userData;
  
  if(!userData) {
    return {
      sid: event.context.session.sid,
      permissions: [],
      preferences: {
        topMenus: [],
      }
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
      ministry: userData.ministry,
      department: userData.department,
      division: userData.division,
      preferences: userData.preferences,
    }
  }
});