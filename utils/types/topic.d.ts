import { Model, Types } from "mongoose";

declare global {
  type TopicStatus = "pending" | "rejected" | "approved";

  interface TopicData {
    _id?: Types.ObjectId,
    status: TopicStatus;
    name: string;
    description: string;
    choices: ChoicesData;
    createdBy: DigitalIDUserId;
    createdByName: string,
    updatedBy: DigitalIDUserId;
    updatedByName: string,
    voteStartAt: Date;
    voteExpiredAt: Date;
    pauseDuration: number,
    createdAt: Date;
    updatedAt: Date;
    
    voterAllows: Array<VoteAllowData>;
    publicVote: boolean;
    notifyVoter: boolean;
    votePauseAt?: Date;
    showVotersScore: boolean;
    showVotersChoicesPublic: boolean;
  }
  
  interface TopicModel extends Model<TopicData> {
    // getLastestPendingTopics(pagesize?: number, startid?: string) : Query<Array<TopicData>, TopicData>;
    getLastestAvailableTopics(filter?: TopicFilterParams, includePrivate: boolean) : Query<Array<TopicData>, TopicData>;
    // getLastestWaitingTopics(pagesize?: number, startid?: string) : Query<Array<TopicData>, TopicData>;
    getLastestActiveTopics(userData: UserData, filter?: TopicFilterParams) : Query<Array<TopicData>, TopicData>;
    // getLastestFinishedTopics(pagesize?: number, startid?: string) : Query<Array<TopicData>, TopicData>;
    // getSelectedTopics(filterIds: Array<Types.ObjectId>) : Query<Array<TopicData>, TopicData>;
  }

  interface ChoicesData {
    choices: Array<{name: string, image?: string}>;
    customable: boolean;
  }

  interface VoteAllowData {
    citizenId: string,
    totalVotes: number,
    remainVotes: number,
  }
  
  type TopicFormData = Omit<TopicData, "_id" | "status" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt" | "votePauseAt" | "pauseDuration" | "createdByName" | "updatedByName" | "voterAllows"> & {
    voterAllows: Array<Omit<VoteAllowData, "remainVotes">>,
  };
  type TopicFormBodyData = Omit<TopicFormData, "voteStartAt" | "voteExpiredAt"> & {
    voteStartAt: DateString,
    voteExpiredAt: DateString
  };

  type TopicFormEditData = TopicFormData & Pick<TopicData, "status">;
  type TopicFormEditBodyData = TopicFormBodyData & Pick<TopicData, "status">;

  type TopicResponseData = Omit<TopicFormBodyData, "forcePending" | "voterAllows"> & Pick<TopicData, "status" | "pauseDuration" | "createdByName" | "updatedByName"> & {
    _id: string,
    createdAt: DateString,
    updatedAt: DateString,
    votePauseAt?: DateString,
    voterAllows: Array<VoteAllowData>,
  };
  
  type TopicQueryType = "pending" | "available" | "finished" | "all" | "active";
  type TopicFilterParams = 
    ({ type: "all" } |
    { 
      type: "date", 
      year: number,
      month: number,
    } |
    {
      type: "ticketId",
      ticketId: string,
    } |
    {
      type: "topicName",
      keyword: string,
    }
    ) & PaginationParams;

  interface TopicQueryParams {
    type?: TopicQueryType,
    filter?: string
  }

  type TopicVoteCountRecord = {choice: string | null, count: number }
  type TopicVoteCountResponse = Pick<TopicResponseData, "_id" | "name" | "description" | "choices" | "voteStartAt" | "voteExpiredAt" | "createdAt" | "updatedAt"> & {
    winners: Array<string | null>,
    scores?: Array<TopicVoteCountRecord>,
    votes?: Array<Omit<VoteResponseData, "_id" | "topicid" | "createdAt"> & { createdAt: DateString }>,
  }
}