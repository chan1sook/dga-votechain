import { Storage, prefixStorage } from "unstorage";
import EVoteUserModel from "~~/server/models/user";

export const USER_SESSION_KEY = "dgaUserData";

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

export async function getSessionData(sid: string) : Promise<UserSessionData | null> {  
  const storage : Storage = useStorage();
  const sessionStorage = prefixStorage(storage, "session");
  
  const sessionHandler = new SessionHandler(sid, sessionStorage);
  const userSessionData = await sessionHandler.get<UserSessionSavedData | undefined>(USER_SESSION_KEY);

  if(userSessionData) {
    try {
      const userData = await EVoteUserModel.findById(userSessionData.userid);
      if(userData) {
        return {
          _id: userData._id,
          hasCitizenId: !!userData.hashedCitizenId,
          permissions: userData.permissions,
          roleMode: userSessionData.roleMode,
          isGovOfficer: userData.isGovOfficer,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          ministry: userData.ministry,
          department: userData.department,
          division: userData.division,
          authFrom: userSessionData.authFrom,
          group: userData.group,
          preferences: userData.preferences,
        };
      }
      return null;
    } catch(err) {
      await sessionHandler.unset(USER_SESSION_KEY);
    }
  }
  return null;
}