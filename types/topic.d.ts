import { Model, Query, Types } from "mongoose";

declare global {
  type TopicStatus = "pending" | "rejected" | "approved";
  type TopicCardStatus = "waiting" | "access" | "voting" | "voted" | "finished" | "result";

  interface TopicData {
    status: TopicStatus;
    name: string;
    description: string;
    multipleVotes: boolean,
    choices: ChoicesData;
    createdBy?: Types.ObjectId | UserResponseFilterData;
    updatedBy?: Types.ObjectId | UserResponseFilterData;
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
  type TopicDataWithIdAndVoterAllow = TopicDataWithId & { voterAllow?: TopicVoterAllowData };
  
  interface TopicModel extends Model<TopicData> {
    getLastestFinishedPublicVoteTopics(filter?: TopicFilterParams) : Query<Array<TopicDataWithId>, TopicData>;
    getLastestVoterTopicsWithIds(ids: Array<Types.ObjectId>, filter?: TopicFilterParams) : Query<Array<TopicDataWithId>, TopicData>;
    getLastestAdminTopics(filter?: TopicFilterParams) : Query<Array<TopicDataWithId>, TopicData>;
  }
  
  interface ChoicesData {
    choices: Array<{name: string, image?: string}>;
    customable: boolean;
  }
  
  type TopicFormData = Omit<TopicData, "_id" | "status" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt" | "votePauseAt" | "pauseDuration" | "voterAllows"> & {
    voterAllows: Array<TopicVoterAllowFormData>,
  };
  type TopicFormBodyData = Omit<TopicFormData, "voteStartAt" | "voteExpiredAt"> & {
    voteStartAt: DateString,
    voteExpiredAt: DateString
  };

  type TopicFormEditData = TopicFormData & Pick<TopicData, "status">;
  type TopicFormEditBodyData = TopicFormBodyData & Pick<TopicData, "status">;

  type TopicResponseData = Omit<TopicFormBodyData, "notifyVoter" | "voterAllows"> & Pick<TopicData, "status"> & {
    _id: string,
    createdAt: DateString,
    updatedAt: DateString,
    notifyVoter?: boolean,
    createdBy?: Pick<UserResponseData, "_id" | "firstName" | "lastName" | "email">,
    updatedBy?: Pick<UserResponseData, "_id" | "firstName" | "lastName" | "email">,
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