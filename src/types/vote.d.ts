import { Model, Types, Query, Document } from "mongoose";

declare global {  
  interface VoteData {
    _id?: Types.ObjectId,
    userid: DigitalIDUserId,
    topicid: Types.ObjectId,
    choice: string | null,
    createdAt: Date,
  }

  interface VoteModel extends Model<VoteData> {
    getLastestVotes(pagesize?: number, startid?: string, filterKeyword?: string) : Query<Array<VoteData>, VoteData>;
    getLastestVotesByUserid(userid: DigitalIDUserId, pagesize?: number, startid?: string) : Query<Array<VoteData>, VoteData>;
  }

  type VoteFormData = Omit<VoteData,  "_id" | "topicid" | "userid" | "createdAt"> & {
    topicid: string,
  };
  
  type VoteResponseData = Omit<VoteData, "_id" | "topicid" | "createdAt"> & {
    _id: string,
    topicid: string,
    createdAt: DateString,
  };

}