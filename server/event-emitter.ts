import EventEmitter from "events";

export const votedEventEmitter : TypeEventEmitter<'voted', VoteResponseData[]> = new EventEmitter();
export const blockchainHbEventEmitter : TypeEventEmitter<'blockchainHb', BlockchainServerData> = new EventEmitter();