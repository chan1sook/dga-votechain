import { Types } from "mongoose";

declare global {
  interface VoterAllowModelData {
    topicid: Types.ObjectId,
    userid: Types.ObjectId,
    remainVotes: number,
    totalVotes: number
  }
  
  type VoterAllowModelDataWithId = VoterAllowModelData & { _id: Types.ObjectId };
  
  interface VoterAllowUserPopulatedData {
    user: UserBasicResponseDataWithId,
    remainVotes: number,
    totalVotes: number
  }
}