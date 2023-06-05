import { Model, Query, Types } from "mongoose";

declare global {
  type NotificationGroup = "request-permission" | "topic";
  interface ReadNotificationModelData {
    userid: Types.ObjectId,
    group: NotificationGroup,
    notifyAt: Date,
  }

  type NotificationRequestGroup = {
    group: "request-permission",
    extra: {
      id: string,
      status: RequestPermissionStatus
    }
  }
  type NotificationTopicGroup = {
    group: "topic",
    extra: {
      id: string,
      name: string,
      status: "pending" | "voting" | "finished"
    }
  }
  type NotificationGroups = NotificationRequestGroup | NotificationTopicGroup;

  type NotificationModelData = {
    userid: Types.ObjectId,
    notifyAt?: Date,
  } & NotificationGroups;

  interface NotificationData {
    _id?: string,
    from: "system" | string,
    target: NotificationTargetData[];
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    notifyAt: Date;
    tags: string[];
  }
  
  interface NotificationModel extends Model<NotificationData> {
    getLastestUnreadNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) : Query<NotificationData[], NotificationData>;
    getLastestReadNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) : Query<NotificationData[], NotificationData>;
    getLastestAllNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) : Query<NotificationData[], NotificationData>;
  }

  interface NotificationTargetData {
    userid: Types.ObjectId,
    readAt?: Date,
  }

  type NotificationTargetResponseData = Omit<NotificationTargetData, "userid"> & {
    userid: string,
  }


  type NotificationUserResponseData = Omit<NotificationData, "target" | "createdAt" | "notifyAt" | "updatedAt"> & {
    _id: string,
    createdAt: DateString,
    notifyAt: DateString,
    readAt?: DateString,
  };

  type NotificationQueryType = "read" | "unread" | "all";
  type NotificationQueryParams = PaginationParams & {
    type?: NotificationQueryType,
  }

  interface NotificationStorageData {
    unread: boolean,
    lastChecked: number,
  }
}