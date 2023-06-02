import { Model, Query, Types } from "mongoose";

declare global {
  interface TopicCtrlPauseModelData {
    topicid: Types.ObjectId;
    pauseAt: Date;
    cause: string,
    resumeAt?: Date;
  }
}