import { Model, Types, Query, Document } from "mongoose";

declare global {  
  interface VoteData {
    _id?: Types.ObjectId,
    userid: Types.ObjectId,
    topicid: Types.ObjectId,
    choice: string | null,
    createdAt: Date,
  }

  interface VoteModel extends Model<VoteData> {
    getLastestVotes(pagesize?: number, startid?: string, filterKeyword?: string) : Query<Array<VoteData>, VoteData>;
    getLastestVotesByUserid(userid: DigitalIDUserId, pagesize?: number, startid?: string) : Query<Array<VoteData>, VoteData>;
  }

  type VoteDataBlockchainInput = {
    _id: Types.ObjectId,
    userid: Types.ObjectId,
    topicid: Types.ObjectId,
    choice: string | null,
  };
  
  type VoteUserData = {
    _id: Types.ObjectId,
  } & Pick<UserData, "firstName" | "lastName" | "email">;

  type VoteDataWithPopulated = Omit<VoteData, "userid"> & {
    userid: VoteUserData
  }

  type VoteFormData = {
    topicid: string,
    votes: Array<string | null>,
  };
  
  type VoteResponseData = Omit<VoteData, "_id" | "userid" | "topicid" | "createdAt"> & {
    _id: string,
    userid: string,
    topicid: string,
    createdAt: DateString,
  };

}