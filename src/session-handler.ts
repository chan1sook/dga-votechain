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