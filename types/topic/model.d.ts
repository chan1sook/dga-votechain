import { type Types } from "mongoose";

declare global {
  type TopicStatus = "pending" | "rejected" | "approved";
  type TopicType = "public" | "private" | "internal"
  type TopicDurationMode = "startDuration" | "startEnd";


  interface TopicModelData {
    status: TopicStatus;
    name: string;
    description: string;
    type: TopicType;
    internalFilter: InternalTopicVisiblityFilter;
    multipleVotes: boolean;
    distinctVotes: boolean;
    choices: ChoicesInfo;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    admin: Types.ObjectId;
    coadmins: Types.ObjectId[];
    durationMode: TopicDurationMode;
    voteStartAt: Date;
    voteExpiredAt: Date;
    anonymousVotes: boolean;
    showCreator: boolean;
    recoredToBlockchain: boolean;
    defaultVotes: number;
    createdAt: Date;
    updatedAt: Date;
    notifyVoter: boolean;
    notifyFinished?: boolean;
    
    publicVote?: boolean;
  }
  
  interface ChoicesInfo {
    choices: ChoiceData[];
    customable: boolean;
  }

  interface ChoiceData {
    name: string,
    image?: string
  };
  
  interface InternalTopicVisiblityFilter {
    ministry: string,
    withDepartment: boolean,
    department: string,
  }

  type TopicModelDataWithId = TopicModelData & { _id: Types.ObjectId };
  
  type TopicModelDataWithIdPopulated = Omit<TopicModelDataWithId, "createdBy"> & {
    createdBy: UserBasicDataWithId;
  };

}
