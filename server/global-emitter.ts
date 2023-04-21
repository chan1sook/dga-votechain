import EventEmitter from "events";

const event = new EventEmitter();
export function getEventEmitter() { return event };