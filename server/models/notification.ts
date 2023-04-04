import { FilterQuery, model, Schema, Types } from "mongoose";
import { getNtpTime } from "~~/server/ntp";

const schema = new Schema<NotificationData, NotificationModel>({
  from: {
    type: String,
    default: "system",
  },
  target: [new Schema({
    citizenId: {
      type: String,
      required: true,
    },
    read: {
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
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
  },
  updatedAt: {
    type: Date,
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
});

schema.pre('save', async function () {
  const today = await getNtpTime();
  if (!this.createdAt) {
    this.createdAt = today;
  }
  this.updatedAt = today;
});


schema.static("getLastestUnreadNotifications", async function getLastestUnreadNotifications(citizenId: string, pagesize?: number, startid?: string) {
  const today = await getNtpTime();
  const query : FilterQuery<NotificationData> = {
    notifyAt: { $lt: today },
    "target.citizenId": citizenId,
    "target.read": { $exists: false }
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return await this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestReadNotifications", async function getLastestReadNotifications(citizenId: string, pagesize?: number, startid?: string) {
  const today = await getNtpTime();
  const query : FilterQuery<TopicData> = {
    notifyAt: { $lt: today },
    "target.citizenId": citizenId,
    "target.read": { $exists: true }
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return await this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestAllNotifications", async function getLastestAllNotifications(citizenId: string, pagesize?: number, startid?: string) {
  const today = await getNtpTime();
  const query : FilterQuery<TopicData> = {
    notifyAt: { $lt: today },
    "target.citizenId": citizenId,
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return await this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

export default model<NotificationData, NotificationModel>('notification', schema);