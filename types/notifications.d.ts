import { Model, Query, Types } from "mongoose";

declare global {
  type NotificationGroup = "request-permission" | "topic";

  type NotificationRequestGroup = {
    group: "request-permission";
    extra: {
      id: string;
      status: RequestPermissionStatus;
    };
  };
  type NotificationTopicGroup = {
    group: "topic";
    extra: {
      id: string;
      name: string;
      status: "voting" | "pause" | "resume" | "finished";
      cause?: string;
    };
  };
  type NotificationGroups = NotificationRequestGroup | NotificationTopicGroup;

  type NotificationModelData = {
    userid: Types.ObjectId;
    notifyAt: Date;
    readAt?: Date;
  } & NotificationGroups;

  type NotificationModelDataWithId = NotificationModelData & {
    _id: Types.ObjectId;
  };

  type NotificationUserResponseData = Omit<
    NotificationModelDataWithId,
    "_id" | "userid" | "notifyAt" | "readAt"
  > & {
    _id: string;
    notifyAt: DateString;
    readAt?: DateString;
  };

  type NotificationQueryParams = PaginationParams;

  interface NotificationStorageData {
    unread: boolean;
    lastChecked: number;
  }
}
