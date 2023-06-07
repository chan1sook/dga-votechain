import { FilterQuery, Types } from "mongoose";
import NotificationModel from "~/src/models/notification";

export async function getUnreadNotificationByUser(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const query : FilterQuery<NotificationModelData> = {
    userid: userid,
    notifyAt: { $lt: new Date() },
    readAt: { $exists: false },
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return NotificationModel.find(query).sort({notifyAt: -1, _id: -1}).limit(pagesize || 50);
}


export async function getNotificationByUser(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const query : FilterQuery<NotificationModelData> = {
    userid: userid,
    notifyAt: { $lt: new Date() },
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return NotificationModel.find(query).sort({notifyAt: -1, _id: -1}).limit(pagesize || 50);
}