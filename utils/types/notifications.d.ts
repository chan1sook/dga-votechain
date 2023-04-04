import { Model, Query, Types } from "mongoose";

declare global {
  interface NotificationData {
    _id?: string,
    from: "system" | string,
    target: Array<NotificationTargetData>;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    notifyAt: Date;
    tags: Array<string>;
  }
  
  interface NotificationModel extends Model<NotificationData> {
    getLastestUnreadNotifications(citizenId: string, pagesize?: number, startid?: string) : Query<Array<NotificationData>, NotificationData>;
    getLastestReadNotifications(citizenId: string, pagesize?: number, startid?: string) : Query<Array<NotificationData>, NotificationData>;
    getLastestAllNotifications(citizenId: string, pagesize?: number, startid?: string) : Query<Array<NotificationData>, NotificationData>;
  }

  interface NotificationTargetData {
    citizenId: string,
    read?: Date,
  }

  type NotificationUserResponseData = Omit<NotificationData, "target" | "createdAt" | "notifyAt" | "updatedAt"> & {
    _id: string,
    createdAt: DateString,
    notifyAt: DateString,
    read?: DateString,
  };

  type NotificationQueryType = "read" | "unread" | "all";
  type NotificationQueryParams = PaginationParams & {
    type?: NotificationQueryType,
  }
}