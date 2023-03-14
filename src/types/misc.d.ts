import { } from "mongoose";

declare global {
  type DateString = string;
  type JSONString = string;

  interface PaginationParams {
    pagesize?: number,
    startid?: string,
  }

  type TxChainQueryParams = PaginationParams & {
    keyword?: string,
  }

  type TxResponseData = Omit<VoteData, "_id" | "topicid" |"createdAt"> & {
    _id: string,
    topicid: DateString,
    createdAt: DateString,
  };
}