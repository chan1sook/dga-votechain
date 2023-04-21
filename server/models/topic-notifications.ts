import { FilterQuery, model, Schema, Types } from "mongoose";
import { clearNotifyData } from "../notify-storage";

const schema = new Schema<TopicNotificationData, TopicNotificationModel>({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "dga-user",
  },
  topicid: {
    type: Schema.Types.ObjectId,
    ref: "topic",
  },
  notifyAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
  }
}, { timestamps: true });

schema.post('save', async function (doc) {
  const promises : Array<Promise<void>> = [];
  promises.push(
    clearNotifyData(doc.userid.toString())
  );
  console.log("Reset Notify Data", promises.length);
  await Promise.all(promises);
});

schema.static("getLastestUnreadNotifications", function getLastestUnreadNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const today = new Date();
  const query : FilterQuery<TopicNotificationData> = {
    notifyAt: { $lt: today },
    userid: userid,
    readAt: { $exists: false }
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1}).populate("topicid");
});

schema.static("getLastestReadNotifications", function getLastestReadNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const today = new Date();
  const query : FilterQuery<TopicNotificationData> = {
    notifyAt: { $lt: today },
    userid: userid,
    readAt: { $exists: true }
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 }).populate("topicid");
});

schema.static("getLastestAllNotifications", async function getLastestAllNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const today = new Date();
  const query : FilterQuery<TopicNotificationData> = {
    notifyAt: { $lt: today },
    userid: userid,
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 }).populate("topicid");
});

export default model<TopicNotificationData, TopicNotificationModel>('topic-notification', schema);