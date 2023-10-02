import bcrypt from "bcrypt";

import {
  authorizationCodeDigitalID,
  DID_VERIFY_CODE,
  getUserInfoDigitalID,
} from "~/src/services/vendor/digital-id";
import UserModel from "~/src/models/user";
import {
  combinePermissions,
  legacyRoleToPermissions,
} from "~/src/services/transform/permission";
import { EXTRA_LOGIN_KEY, USER_SESSION_KEY } from "~/server/session-handler";
import {
  getActiveUserByAuthSource,
  getActiveUserByCitizenID,
  getActiveUserByNameOld,
} from "~/src/services/fetch/user";
import { compareAuthSourceFn } from "~/src/services/validations/user";
import { getAfterRedirectUrlbyParam } from "~/src/services/transform/url";

export default defineEventHandler(async (event) => {
  const { code, state } = getQuery(event);

  const {
    DID_CLIENT_KEY,
    DID_LOGIN_CALLBACK,
    CITIZENID_FIXED_SALT,
    DID_API_URL,
    ACCOUNT_DEV_CIDS,
  } = useRuntimeConfig();

  const extraData: LoginExtraParams | undefined =
    await event.context.session.get<LoginExtraParams | undefined>(
      EXTRA_LOGIN_KEY
    );

  // sometime extraData is undefined
  console.log("extra_get", extraData);
  console.log("state", state);

  if (extraData && extraData.state !== state?.toString()) {
    // throw createError({
    //   statusCode: 400,
    //   statusMessage: "State Invalid",
    // });
    return sendRedirect(event, "/login");
  }

  if (typeof code === "string") {
    const { access_token, id_token } = await authorizationCodeDigitalID(code, {
      DID_API_URL,
      DID_CLIENT_KEY,
      DID_LOGIN_CALLBACK,
      DID_VERIFY_CODE,
    });

    const digitalIdUserInfo = await getUserInfoDigitalID(access_token, {
      DID_API_URL,
    });

    const authSource: UserAuthSourceData = {
      authSource: "digitalId",
      digitalIdUserId: digitalIdUserInfo.user_id,
    };
    let userDoc = await getActiveUserByAuthSource(authSource);

    if (!userDoc) {
      userDoc = await getActiveUserByCitizenID(digitalIdUserInfo.citizen_id);
    }

    // Temp fixed
    if (!userDoc) {
      userDoc = await getActiveUserByNameOld(
        digitalIdUserInfo.given_name,
        digitalIdUserInfo.family_name
      );
    }

    if (!userDoc) {
      userDoc = new UserModel({
        permissions: legacyRoleToPermissions("admin"),
        authSources: [authSource],
        firstName: digitalIdUserInfo.given_name,
        lastName: digitalIdUserInfo.family_name,
        email: digitalIdUserInfo.email,
      });
    }

    if (userDoc) {
      if (
        !userDoc.authSources.find((ele) => compareAuthSourceFn(ele, authSource))
      ) {
        userDoc.authSources.push(authSource);
      }

      // auto apply some
      if (!userDoc.firstName) {
        userDoc.firstName = digitalIdUserInfo.given_name;
      }

      if (!userDoc.lastName) {
        userDoc.lastName = digitalIdUserInfo.family_name;
      }

      if (!userDoc.email) {
        userDoc.email = digitalIdUserInfo.email;
      }

      if (!userDoc.cidHashed) {
        const cidHashed = await bcrypt.hash(
          digitalIdUserInfo.citizen_id,
          CITIZENID_FIXED_SALT
        );
        userDoc.cidHashed = cidHashed;
      }

      if (ACCOUNT_DEV_CIDS.includes(digitalIdUserInfo.citizen_id)) {
        userDoc.permissions = combinePermissions(
          userDoc.permissions,
          ...legacyRoleToPermissions("developer")
        );
      }

      await userDoc.save();
    }

    await event.context.session.set<UserSessionSavedData>(USER_SESSION_KEY, {
      userid: userDoc._id.toString(),
      roleMode: "voter",
      authFrom: {
        ...authSource,
        userToken: id_token,
      },
    });
    await event.context.session.unset(EXTRA_LOGIN_KEY);

    return sendRedirect(event, getAfterRedirectUrlbyParam(extraData || {}));
  }

  return sendRedirect(event, "/login");
});
