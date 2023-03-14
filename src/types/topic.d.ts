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
    updatedBy: DigitalIDUserId;
    voteStartAt: Date;
    voteExpiredAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  interface TopicModel extends Model<TopicData> {
    getLastestPendingTopics(pagesize?: number, startid?: string) : Query<Array<TopicData>, TopicData>;
    getLastestAvalaibleTopics(pagesize?: number, startid?: string) : Query<Array<TopicData>, TopicData>;
    getLastestWaitingTopics(pagesize?: number, startid?: string) : Query<Array<TopicData>, TopicData>;
    getLastestActiveTopics(pagesize?: number, startid?: string, excludedIds?: Array<Types.ObjectId>) : Query<Array<TopicData>, TopicData>;
    getLastestFinishedTopics(pagesize?: number, startid?: string) : Query<Array<TopicData>, TopicData>;
    getSelectedTopics(filterIds: Array<Types.ObjectId>) : Query<Array<TopicData>, TopicData>;
  }

  interface ChoicesData {
    choices: Array<{name: string, image?: string}>;
    customable: boolean;
  }
  
  type TopicFormData = Omit<TopicData, "_id" | "status" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt">;
  type TopicFormBodyData = Omit<TopicFormData, "voteStartAt" | "voteExpiredAt"> & {
    voteStartAt: DateString,
    voteExpiredAt: DateString,
    forcePending?: boolean,
  };

  type TopicFormEditData = TopicFormData & Pick<TopicData, "status">;
  type TopicFormEditBodyData = TopicFormBodyData & Pick<TopicData, "status">;

  type TopicResponseData = Omit<TopicFormBodyData, "forcePending"> & Pick<TopicData, "status"> & {
    _id: string,
    createdAt: DateString,
    updatedAt: DateString,
  };
  
  type TopicQueryType = "pending" | "available" | "finished" | "all" | "notvoted" | "voted" | "waiting" | "active";
  type TopicQueryParams = PaginationParams & {
    type?: TopicQueryType,
  }

  type TopicVoteCountRecord = {choice: string | null, count: number }
  type TopicVoteCountResponse = TopicResponseData & {
    votes: Array<TopicVoteCountRecord>
  }
}