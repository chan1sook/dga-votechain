import { Model, Query, Types } from "mongoose";

declare global {
  interface TopicVoterAllowData {
    topicid: Types.ObjectId,
    
    userid?: Types.ObjectId,
    firstName?: string,
    lastName?: string,
    email?: string,
    hashedCitizenId?: string,

    remainVotes: number,
    totalVotes: number
  }

  type TopicVoterAllowDataWithId = TopicVoterAllowData & { _id: Types.ObjectId };
  
  interface TopicVoterAllowModel extends Model<TopicVoterAllowData> {
    getVoterAllowForTopicsFilters(userid: Types.ObjectId, pagesize?: number, startTopicid?: string) : Query<Array<TopicVoterAllowDataWithId>, TopicVoterAllowData>;
  }

  type TopicVoterAllowResponseData = Omit<TopicVoterAllowData, "topicid" | "userid"> & {
    topicid: string,
    userid?: string,
  }

  type TopicVoterAllowDataPopulated = Omit<TopicVoterAllowData, "userid"> & { userid?: UserData & { _id: Types.ObjectId } }

  interface TopicVoterAllowFormData {
    userid?: string,
    email?: string,
    firstName?: string,
    lastName?: string,
    citizenId?: string,
    totalVotes: number,
  }

  interface CoadminFormData {
    userid?: string,
    email?: string,
    firstName?: string,
    lastName?: string,
  }
}