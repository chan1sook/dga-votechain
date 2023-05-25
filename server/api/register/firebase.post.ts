
import { getAuth } from "firebase-admin/auth";
import { getApp } from "firebase-admin/app";
import bcrypt from "bcrypt";

import EVoteUserModel from "~~/server/models/user"
import { checkPermissionNeeds, legacyRoleToPermissions } from "~~/src/utils/permissions";
import { USER_SESSION_KEY } from "~~/server/session-handler";
import { getUserByAuthSource, getUserByEmail } from "~~/server/utils";

export default defineEventHandler(async (event) => {
  const { token, citizenid } : { token? :string, citizenid?: string} = await readBody(event);

  if(typeof token === "string" && typeof citizenid === "string") {
    const hashedCitizenId = bcrypt.hashSync(citizenid, 12);
    const decodedFirebaseUserdata = await getAuth(getApp()).verifyIdToken(token, true).catch((err) => {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Token'
      })
    })
    const authSource: UserAuthSource = {
      authSource: "firebase",
      firebaseUid: decodedFirebaseUserdata.uid,
    };
    let userDoc = await getUserByAuthSource(authSource);
    if(!userDoc) {
      userDoc = await getUserByEmail(decodedFirebaseUserdata.email);
      if(!userDoc) {
        userDoc = new EVoteUserModel({
          permissions: legacyRoleToPermissions("voter"),
          authSources: [
            { authSource: "firebase", firebaseUid: decodedFirebaseUserdata.uid }
          ],
          email: decodedFirebaseUserdata.email,
          hashedCitizenId,
        });
        await userDoc.save();
      } else {
        userDoc.authSources.push({ authSource: "firebase", firebaseUid: decodedFirebaseUserdata.uid });
        userDoc.markModified("authSources");
        await userDoc.save();
      }
    } else {
      // already register error
      return createError({
        statusCode: 500,
        statusMessage: "Already Registered",
      })
    }

    let defaultRoleMode : UserRole = "voter";
    if(checkPermissionNeeds(userDoc.permissions, "admin-mode")) {
      defaultRoleMode = "admin";
    }

    await event.context.session.set<UserSessionSavedData>(USER_SESSION_KEY, {
      userid: userDoc._id.toString(),
      roleMode: defaultRoleMode,
      authFrom: authSource,
    });

    return {
      status: "OK",
    }
  }

  return createError({
    statusCode: 400,
    statusMessage: "Invalid Register Data",
  })
})