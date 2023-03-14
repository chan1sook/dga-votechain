import { Model } from "mongoose";;

declare module "h3" {
  interface H3EventContext extends Record<string, any> {
    session: SessionHandler,
    userData?: UserData,
  }
}

declare global {
  type UnstorageStorage = import("unstorage").Storage;

  interface SessionHandler {
    sid: Readonly<string>;
    get: <T>(key: string) => Promise<T>;
    getAll: () => Promise<Record<string, any>>;
    set: <T>(key: string, value: T) => Promise<void>;
    unset: <T>(key: string) => Promise<void>;
    clear: () => Promise<void>;
  }
}
