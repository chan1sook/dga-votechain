import dayjs from "dayjs"
import { nanoid } from "nanoid"
import { Storage, prefixStorage } from "unstorage"
import { getNtpTime } from "~~/server/ntp";
import { SessionHandler, getSessionData } from "~~/server/session-handler";

export default defineEventHandler(async (event) => {
  let sid = getCookie(event, "sid");

  const storage : Storage = useStorage();
  const sessionStorage = prefixStorage(storage, "session");
  const sessionExpired =  dayjs(getNtpTime()).add(60, "minute").toDate();

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
  
  const userData = await getSessionData(sid);
  if(userData) {
    event.context.userData = userData;
  }
})