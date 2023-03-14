
export default defineEventHandler<UserResponseData>(async (event) => {
  const userData = event.context.userData;
  if(!userData) {
    return {
      permissions: [],
    }
  } else {
    return {
      userid: userData.userid,
      permissions: userData.permissions,
    }
  }
});