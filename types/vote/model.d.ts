import { Types } from "mongoose";

declare global {
  type ChoiceDataType = string | null;

  interface VoteModelData {
    userid?: Types.ObjectId,
    topicid: Types.ObjectId,
    groupid: string,
    choice: ChoiceDataType,
    createdAt: Date,
    tx: string | null,
  }

  type VoteModelDataWithId = VoteModelData & {
    _id: Types.ObjectId
  }

  type VoteResponseData = Omit<VoteModelData, "userid" | "topicid" | "createdAt"> & {
    _id: string,
    userid?: string,
    topicid: string,
    createdAt: DateString,
  };

  interface AnonymousVoteResponseData {
    groupid: string,
    count: number,
  }
}