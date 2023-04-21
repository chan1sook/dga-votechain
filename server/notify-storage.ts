import { Storage, prefixStorage } from "unstorage";

export class NotifyHandler {
  #userid: string;
  #storage: UnstorageStorage;
  
  constructor(citizenId: string, sessionStorage: UnstorageStorage) {
    this.#userid = citizenId;
    this.#storage = sessionStorage;
  }

  get sid() {
    return this.#userid;
  }

  async get<T>(key: string) {
    const data = await this.getAll();
    return data[key] as T;
  }

  async getAll() {
    const data = await this.#storage.getItem(this.#userid);
    if(!data || typeof data !== "object") {
      return {}
    }
    return data as Record<string, any>;
  }

  async set<T>(key: string, value: T) {
    if(key === "citizenId") {
      throw new Error("Reserved key");
    }

    const data = await this.getAll();
    data[key] = value;
    return this.#storage.setItem(this.#userid, data);
  }

  async unset(key: string) {
    if(key === "citizenId") {
      throw new Error("Reserved key");
    }

    const data = await this.getAll();
    delete data[key];
    return this.#storage.setItem(this.#userid, data);
  }

  async clear() {
    return this.#storage.setItem(this.#userid, {
      citizenId: this.#userid,
    });
  }
}

const storage : Storage = useStorage();
const notifyStorage = prefixStorage(storage, "notify");

export async function getNotifyData(userid: string) {  
  const notifyHandler = new NotifyHandler(userid, notifyStorage);

  const notifyData = await notifyHandler.get<NotificationStorageData | undefined>("notifyData");
  return notifyData;
}

export async function clearNotifyData(userid: string) {
  const notifyHandler = new NotifyHandler(userid, notifyStorage);

  await notifyHandler.unset("notifyData");
}

export async function setNotifyData(userid: string, data : NotificationStorageData) {  
  const notifyHandler = new NotifyHandler(userid, notifyStorage);

  await notifyHandler.set<NotificationStorageData>("notifyData", data);
}