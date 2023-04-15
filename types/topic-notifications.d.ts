import { Model, Query, Types } from "mongoose";

declare global {
  interface TopicNotificationData {
    userid: Types.ObjectId,
    topicid: Types.ObjectId,
    createdAt: Date;
    updatedAt: Date;
    notifyAt: Date;
    readAt?: Date;
  }
  
  interface TopicNotificationModel extends Model<TopicNotificationData> {
    getLastestUnreadNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) : Query<Array<TopicNotificationDataWithPopulate>, TopicNotificationDataWithPopulate>;
    getLastestReadNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) : Query<Array<TopicNotificationDataWithPopulate>, TopicNotificationDataWithPopulate>;
    getLastestAllNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) : Query<Array<TopicNotificationDataWithPopulate>, TopicNotificationDataWithPopulate>;
  }

  type TopicNotificationDataWithPopulate = Omit<TopicNotificationData, "topicid"> & {
    _id: Types.ObjectId,
    topicid?: TopicDataWithId,
  }
}