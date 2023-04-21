import { FilterQuery, model, Schema, Types } from "mongoose";
import { clearNotifyData } from "../notify-storage";

const schema = new Schema<NotificationData, NotificationModel>({
  from: {
    type: String,
    default: "system",
  },
  target: [new Schema({
    userid: {
      type: Schema.Types.ObjectId,
      ref: "dga-user"
    },
    readAt: {
      type: Date,
    }
  })],
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  notifyAt: {
    type: Date,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

schema.post('save', async function (doc) {
  const promises : Array<Promise<void>> = [];
  for(const target of doc.target) {
    promises.push(
      clearNotifyData(target.userid.toString())
    );
  }
  console.log("Reset Notify Data", promises.length);
  await Promise.all(promises);
});

schema.static("getLastestUnreadNotifications", function getLastestUnreadNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const today = new Date();
  const query : FilterQuery<NotificationData> = {
    notifyAt: { $lt: today },
    "target.userid": userid,
    "target.readAt": { $exists: false }
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1});
});

schema.static("getLastestReadNotifications", function getLastestReadNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const today = new Date();
  const query : FilterQuery<NotificationData> = {
    notifyAt: { $lt: today },
    "target.userid": userid,
    "target.readAt": { $exists: true }
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestAllNotifications", async function getLastestAllNotifications(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const today = new Date();
  const query : FilterQuery<NotificationData> = {
    notifyAt: { $lt: today },
    "target.userid": userid,
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

export default model<NotificationData, NotificationModel>('notification', schema);