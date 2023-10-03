import {
  DID_VERIFY_CODE,
  generateDigitalIDLoginUrl,
  generateDigitalIDRegisterUrl,
} from "~/src/services/vendor/digital-id";
import { generatThaIDLoginUrl } from "~/src/services/vendor/thaid";
import { EXTRA_LOGIN_KEY } from "../session-handler";
import { encodeLoginState } from "~/src/services/transform/login";

export default defineEventHandler(async (event) => {
  const param = await readBody(event);

  const cbtid = param.cbtid?.toString();
  const EXTRA_DATA: LoginExtraParams = {
    cbtid,
  };
  const state = encodeLoginState(EXTRA_DATA);

  await event.context.session.set<LoginExtraParams>(
    EXTRA_LOGIN_KEY,
    EXTRA_DATA
  );

  if (param.source === "digitalId") {
    const { DID_CLIENT_KEY, DID_LOGIN_CALLBACK, DID_API_URL } =
      useRuntimeConfig();

    if (param.register === "1") {
      const url = generateDigitalIDRegisterUrl({
        DID_API_URL,
        DID_CLIENT_KEY,
        DID_LOGIN_CALLBACK,
        DID_VERIFY_CODE,
        STATE: state,
      });
      return sendRedirect(event, url);
    } else {
      const url = generateDigitalIDLoginUrl({
        DID_API_URL,
        DID_CLIENT_KEY,
        DID_LOGIN_CALLBACK,
        DID_VERIFY_CODE,
        STATE: state,
      });
      return sendRedirect(event, url);
    }
  } else if (param.source === "thaID") {
    const {
      THAID_API_KEY,
      THAID_CLIENT_ID,
      THAID_CLIENT_SECRET,
      THAID_LOGIN_CALLBACK,
    } = useRuntimeConfig();
    const url = generatThaIDLoginUrl({
      THAID_API_KEY,
      THAID_CLIENT_ID,
      THAID_CLIENT_SECRET,
      THAID_LOGIN_CALLBACK,
      STATE: state,
    });

    setHeader(event, "Content-type", "application/x-www-form-urlencoded");
    setHeader(event, "x-imauth-apikey", THAID_API_KEY);
    const authBasic =
      "Basic " +
      Buffer.from(THAID_CLIENT_ID + ":" + THAID_CLIENT_SECRET).toString(
        "base64"
      );
    setHeader(event, "Authorization", authBasic);

    return sendRedirect(event, url);
  }

  throw createError({
    statusCode: 400,
    statusMessage: "Invalid Login Methods",
  });
});
