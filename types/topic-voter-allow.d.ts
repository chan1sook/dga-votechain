import { Model, Query, Types } from "mongoose";

declare global {
  interface TopicVoterAllowData {
    topicid: Types.ObjectId,
    userid: Types.ObjectId,
    remainVotes: number,
    totalVotes: number
  }

  type TopicVoterAllowDataWithId = TopicVoterAllowData & { _id: Types.ObjectId };
  
  interface TopicVoterAllowModel extends Model<TopicVoterAllowData> {
    getVoterAllowForTopicsFilters(userid: Types.ObjectId, pagesize?: number, startTopicid?: string) : Query<Array<TopicVoterAllowDataWithId>, TopicVoterAllowData>;
  }

  type TopicVoterAllowResponseData = Omit<TopicVoterAllowData, "topicid" | "userid"> & {
    topicid: string,
    userid: string,
  }

  interface TopicVoterAllowFormData {
    userid: string,
    totalVotes: number
  }

  type TopicVoterAllowFormDataWithHint = TopicVoterAllowFormData & {
    firstName?: string,
    lastName?: string,
    email?: string,
  }
}