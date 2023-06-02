import EventEmitter from "events";

declare global {
  interface TypeEventEmitter<K extends string, T> extends EventEmitter {
    on: (name: K, fn: (param: T) => void) => void,
    once: (name: K, fn: (param: T) => void) => void,
    emit: (name: K, param: T) => void,
  }
}