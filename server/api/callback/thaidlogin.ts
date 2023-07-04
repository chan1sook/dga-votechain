
import bcrypt from "bcrypt";

import UserModel from "~/src/models/user"
import { legacyRoleToPermissions } from "~/src/services/transform/permission";
import { USER_SESSION_KEY } from "~/server/session-handler";
import { getActiveUserByAuthSource, getActiveUserByCitizenID }  from "~/src/services/fetch/user";
import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";
import { authorizationThaID } from "~/src/services/vendor/thaid";

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  const { THAID_API_KEY, THAID_CLIENT_ID, THAID_CLIENT_SECRET, THAID_LOGIN_CALLBACK, CITIZENID_FIXED_SALT } = useRuntimeConfig()

  if(typeof code === "string") {
    const data = await authorizationThaID(code, { THAID_API_KEY, THAID_CLIENT_ID, THAID_CLIENT_SECRET, THAID_LOGIN_CALLBACK });

    const modifiedPID = Buffer.from(Buffer.from("tha" + data.pid + "id").reverse().map((n) => 0xFF - n)).toString("base64");

    const thaIDUserId = await bcrypt.hash(modifiedPID, CITIZENID_FIXED_SALT);
    const authSource : UserAuthSourceData = {
      authSource: "thaID",
      thaIDUserId: thaIDUserId,
    };

    let userDoc = await getActiveUserByAuthSource(authSource);

    if(!userDoc) {
      userDoc = await getActiveUserByCitizenID(data.pid);
    }

    if(!userDoc) {
      userDoc = new UserModel({
        permissions: legacyRoleToPermissions("admin"),
        authSources: [authSource],
        firstName: data.th_fname,
        lastName: data.th_lname,
      });
    }

    if(userDoc) {
      if(!userDoc.authSources.find((ele) => JSON.stringify(ele) === JSON.stringify(authSource))) {
        userDoc.authSources.push(authSource);
      }
      
      // auto apply some
      if(!userDoc.firstName) {
        userDoc.firstName = data.th_fname;
      }

      if(!userDoc.lastName) {
        userDoc.lastName = data.th_lname;
      }

      const cidHashed = await bcrypt.hash(data.pid, CITIZENID_FIXED_SALT);
      userDoc.cidHashed = cidHashed;

      await userDoc.save();
    }

    let defaultRoleMode : UserRole = "voter";
    if(isBannedUser(userDoc)) {
      defaultRoleMode = "guest";
    } else if(checkPermissionNeeds(userDoc.permissions, "admin-mode")) {
      defaultRoleMode = "admin";
    }

    await event.context.session.set<UserSessionSavedData>(USER_SESSION_KEY, {
      userid: userDoc._id.toString(),
      roleMode: defaultRoleMode,
      authFrom: {
        ...authSource,
      },
    });

    return sendRedirect(event, "/topics");
  }

  return sendRedirect(event, "/login");
})