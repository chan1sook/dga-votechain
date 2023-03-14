import dayjs from "dayjs"
import { nanoid } from "nanoid"
import { Storage, prefixStorage } from "unstorage"
import { SessionHandler } from "~~/src/session-handler";
import { getUserInfoDigitalID } from "~~/src/utils/digitalid-protocol";

import UserModel from "~~/src/models/user"

export default defineEventHandler(async (event) => {
  // Handle cookie & Storage
  let sid = getCookie(event, "sid");

  const storage : Storage = useStorage();
  const sessionStorage = prefixStorage(storage, "session");
  const sessionExpired =  dayjs().add(30, "minute").toDate();

  if(!sid) {
    sid = nanoid(32);
    await sessionStorage.setItem(sid, {
      sid
    })
  }

  setCookie(event, "sid", sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: sessionExpired
  })
  
  event.context.session = new SessionHandler(sid, sessionStorage);

  // Handle userdata
  const userData = await event.context.session.get<UserSessionStorageData | undefined>("userData");

  const { public: { DID_API_URL } } = useRuntimeConfig();

  if(userData) {
    try {
      const [{ permissions, createdAt, updatedAt }, digitalIdUserInfo ] = await Promise.all([
        UserModel.ensureUserData(userData.userid),
        await getUserInfoDigitalID(userData.accessToken, { DID_API_URL }),
      ]);

      if(digitalIdUserInfo.user_id !== userData.userid) {
        throw new Error("Mismatch userid");
      }

      event.context.userData = {
        userid: userData.userid,
        accessToken: userData.accessToken,
        idToken: userData.idToken,
        digitalIdUserInfo,
        permissions,
        createdAt,
        updatedAt,
      };
    } catch(err) {
      await event.context.session.unset("userData");
    }
  }
 
  // console.log(event.context.userData);
})