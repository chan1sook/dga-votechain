import { getUserInfoDigitalID } from "../src/utils/digitalid-protocol";
import { Storage, prefixStorage } from "unstorage";
import UserModel from "~~/server/models/user";

export class SessionHandler {
  #sid: string;
  #storage: UnstorageStorage;
  
  constructor(sid: string, sessionStorage: UnstorageStorage) {
    this.#sid = sid;
    this.#storage = sessionStorage;
  }

  get sid() {
    return this.#sid;
  }

  async get<T>(key: string) {
    const data = await this.getAll();
    return data[key] as T;
  }

  async getAll() {
    const data = await this.#storage.getItem(this.#sid);
    if(!data || typeof data !== "object") {
      return {}
    }
    return data as Record<string, any>;
  }

  async set<T>(key: string, value: T) {
    if(key === "sid") {
      throw new Error("Reserved key");
    }

    const data = await this.getAll();
    data[key] = value;
    return this.#storage.setItem(this.#sid, data);
  }

  async unset(key: string) {
    if(key === "sid") {
      throw new Error("Reserved key");
    }

    const data = await this.getAll();
    delete data[key];
    return this.#storage.setItem(this.#sid, data);
  }

  async clear() {
    return this.#storage.setItem(this.#sid, {
      sid: this.#sid,
    });
  }
}

export async function getSessionData(sid: string) {  
  const storage : Storage = useStorage();
  const sessionStorage = prefixStorage(storage, "session");
  const { public: { DID_API_URL } } = useRuntimeConfig();

  const sessionHandler = new SessionHandler(sid, sessionStorage);
  const userData = await sessionHandler.get<UserSessionStorageData | undefined>("userData");

  if(userData) {
    try {
      const [{ permissions, createdAt, updatedAt }, digitalIdUserInfo ] = await Promise.all([
        UserModel.ensureUserData(userData.userid),
        await getUserInfoDigitalID(userData.accessToken, { DID_API_URL }),
      ]);

      if(digitalIdUserInfo.user_id !== userData.userid) {
        throw new Error();
      }

      return {
        userid: userData.userid,
        accessToken: userData.accessToken,
        idToken: userData.idToken,
        roleMode: userData.roleMode,
        digitalIdUserInfo,
        permissions,
        createdAt,
        updatedAt,
      };
    } catch(err) {
      await sessionHandler.unset("userData");
    }
  }
  return undefined;
}