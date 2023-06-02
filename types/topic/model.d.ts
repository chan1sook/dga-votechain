import { type Types } from "mongoose";

declare global {
  type TopicStatus = "pending" | "rejected" | "approved";
  type TopicDurationMode = "startDuration" | "startEnd";

  interface TopicModelData {
    status: TopicStatus;
    name: string;
    description: string;
    multipleVotes: boolean;
    choices: ChoicesInfo;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    admin: Types.ObjectId;
    coadmins: Types.ObjectId[];
    durationMode: TopicDurationMode;
    voteStartAt: Date;
    voteExpiredAt: Date;
    publicVote: boolean;
    recoredToBlockchain: boolean;
    defaultVotes: number;
    createdAt: Date;
    updatedAt: Date;
    notifyVoter: boolean;
  }
  
  interface ChoicesInfo {
    choices: ChoiceData[];
    customable: boolean;
  }

  interface ChoiceData {
    name: string,
    image?: string
  };
  
  type TopicModelDataWithId = TopicModelData & { _id: Types.ObjectId };
  
  type TopicModelDataWithIdPopulated = Omit<TopicModelDataWithId, "createdBy"> & {
    createdBy: UserBasicDataWithId;
  };

}
