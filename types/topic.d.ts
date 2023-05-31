import { Model, Query, Types } from "mongoose";

declare global {
  type TopicStatus = "pending" | "rejected" | "approved";
  type TopicCardStatus = "waiting" | "access" | "voting" | "voted" | "finished" | "result";

  interface TopicData {
    status: TopicStatus,
    name: string,
    description: string,
    multipleVotes: boolean,
    choices: ChoicesData,
    createdBy: Types.ObjectId,
    updatedBy: Types.ObjectId,
    admin: Types.ObjectId,
    coadmins: Array<Types.ObjectId>
    durationMode?: TopicDurationMode,
    voteStartAt: Date;
    voteExpiredAt: Date;
    publicVote: boolean;
    showScores: boolean;
    showVotersChoicesPublic: boolean;
    recoredToBlockchain: boolean;
    createdAt: Date;
    updatedAt: Date;
    notifyVoter: boolean;
  }

  type TopicDurationMode = "startDuration" | "startEnd";

  type TopicDataWithId = TopicData & { _id: Types.ObjectId };
  type TopicDataWithIdPopulated = Omit<TopicDataWithId, "createdBy"> & {
    createdBy: UserBasicDataWithId;
  };

  type TopicDataWithIdAndVoterAllow = TopicDataWithId & { voterAllow?: TopicVoterAllowData };
  
  interface VoteControllerData {
    user: Types.ObjectId,
    type: "admin" | "coadmin",
  }
  
  interface TopicModel extends Model<TopicData> {
    getLastestFinishedPublicVoteTopics(filter?: TopicFilterParams) : Query<Array<TopicDataWithId>, TopicData>;
    getLastestVoterTopicsWithIds(ids: Array<Types.ObjectId>, filter?: TopicFilterParams) : Query<Array<TopicDataWithId>, TopicData>;
    getLastestAdminTopics(ids: Types.ObjectId, filter?: TopicFilterParams) : Query<Array<TopicDataWithId>, TopicData>;
    getPendingTopics(filter?: TopicFilterParams) : Query<Array<TopicDataWithId>, TopicData>;
  }
  
  interface ChoicesData {
    choices: Array<{name: string, image?: string}>;
    customable: boolean;
  }
  
  type TopicFormData = Omit<TopicData, "_id" | "status" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt" | "votePauseAt" | "pauseDuration" | "admin" | "coadmins"> & {
    voterAllows: Array<TopicVoterAllowFormData>,
    coadmins: Array<string>,
  };

  type VoteControllerFormData = Omit<VoteControllerData, "user"> & {
    user: string,
  }

  type TopicFormBodyData = Omit<TopicFormData, "voteStartAt" | "voteExpiredAt"> & {
    voteStartAt: DateString,
    voteExpiredAt: DateString
  };

  type TopicFormEditData = TopicFormData & Pick<TopicData, "status">;
  type TopicFormEditBodyData = TopicFormBodyData & Pick<TopicData, "status">;

  type TopicResponseData = Omit<TopicFormBodyData, "voterAllows" | "admin" | "coadmins"> & Pick<TopicData, "status"> & {
    _id: string,
    createdAt: DateString,
    updatedAt: DateString,
    createdBy: UserBasicResponseDataWithId,
    updatedBy: string,
    admin: string,
    coadmins: Array<string>,
  };
  type TopicResponseDataExtended = TopicResponseData & {
    voterAllow?: TopicVoterAllowResponseData,
    pauseData: Array<TopicPauseResponseData>
  }
  
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

  type TopicVoteCountRecord = {choice: string | null, count: number }
  type TopicVoteCountResponse = Pick<TopicResponseData, "_id" | "name" | "description" | "choices" | "voteStartAt" | "voteExpiredAt" | "createdAt" | "updatedAt" | "durationMode"> & {
    winners: Array<{choice: string | null, rank: number }>,
    scores?: Array<TopicVoteCountRecord>,
    votes?: Array<Omit<VoteResponseData, "_id" | "userid" | "topicid" | "createdAt"> & {
      userid: {
        _id: string,
        firstName?: string,
        lastName?: string,
        email?: string
      },
      createdAt: DateString
    }>,
    yourVotes?: Array<{
      choice: string | null,
      createdAt: DateString
    }>
  }
}