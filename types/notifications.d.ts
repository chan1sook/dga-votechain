import { Model, Query, Types } from "mongoose";

declare global {
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