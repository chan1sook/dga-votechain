import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  const userSessionResponseData: UserResponseData = {
    roleMode: "guest",
  };

  if (userData) {
    userSessionResponseData.userid = userData._id.toString();
    userSessionResponseData.hasCitizenId = userData.hasCitizenId;
    userSessionResponseData.roleMode = userData.roleMode;
    userSessionResponseData.isGovOfficer = userData.isGovOfficer;
    userSessionResponseData.permissions = userData.permissions;
    userSessionResponseData.firstName = userData.firstName;
    userSessionResponseData.lastName = userData.lastName;
    userSessionResponseData.email = userData.email;
    userSessionResponseData.ministry = userData.ministry;
    userSessionResponseData.department = userData.department;
    userSessionResponseData.division = userData.division;
    userSessionResponseData.preferences = userData.preferences;
    userSessionResponseData.bannedUntil = userData.bannedUntil
      ? dayjs(userData.bannedUntil).toString()
      : undefined;
  }

  return userSessionResponseData;
});
