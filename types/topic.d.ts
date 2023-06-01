import { Model, Query, Types } from "mongoose";

declare global {
  type TopicCardStatus = "waiting" | "access" | "voting" | "voted" | "finished" | "result";

  type TopicDataWithIdPopulated = Omit<TopicModelDataWithId, "createdBy"> & {
    createdBy: UserBasicDataWithId;
  };

  type TopicDataWithIdAndVoterAllow = TopicModelDataWithId & { voterAllow?: TopicVoterAllowModelData };

  type TopicResponseData = Omit<TopicFormBodyData, "voterAllows" | "admin" | "coadmins"> & Pick<TopicModelData, "status"> & {
    _id: string,
    createdAt: DateString,
    updatedAt: DateString,
    createdBy: UserBasicResponseDataWithId,
    updatedBy: string,
    admin: string,
    coadmins: string[],
  };
  type TopicResponseDataExtended = TopicResponseData & {
    voterAllow?: TopicVoterAllowResponseData,
    pauseData: TopicPauseResponseData[]
  }

}