import { Model, Query, Types } from "mongoose";

declare global {
  interface TopicVoterAllowModelData {
    topicid: Types.ObjectId,
    userid: Types.ObjectId,
    remainVotes: number,
    totalVotes: number
  }

  type TopicVoterAllowDataWithId = TopicVoterAllowModelData & { _id: Types.ObjectId };
  
  interface TopicVoterAllowModel extends Model<TopicVoterAllowModelData> {
    getVoterAllowForTopicsFilters(userid: Types.ObjectId, pagesize?: number, startTopicid?: string) : Query<TopicVoterAllowDataWithId[], TopicVoterAllowModelData>;
  }

  type TopicVoterAllowResponseData = Omit<TopicVoterAllowModelData, "topicid" | "userid"> & {
    topicid: string,
    userid?: string,
  }

  type TopicVoterAllowDataPopulated = Omit<TopicVoterAllowModelData, "userid"> & { userid?: UserModelData & { _id: Types.ObjectId } }

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

  interface TopicVoterAllowUserPopulatedData {
    user: UserBasicResponseDataWithId,
    remainVotes: number,
    totalVotes: number
  }
}