import { FilterQuery, model, Schema, Types } from "mongoose";
import { getNtpTime } from "~~/server/ntp";

const schema = new Schema<NewsData, NewsModel>({
  title: {
    type: String,
    required: true,
  },
  visibility: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  references: {
    type: String,
  },
  createdBy: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
  },
  newsPublishAt: {
    type: Date,
    required: true,
  },
  newsExpiredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  }
});

schema.pre('save', async function () {
  const today = await getNtpTime();
  if (!this.createdAt) {
    this.createdAt = today;
  }
  this.updatedAt = today;
});

schema.static("getLastestAvaliableNews", async function getLastestAvaliableNews(pagesize?: number, startid?: string) {
  const today = await getNtpTime();
  const query : FilterQuery<NewsData> = {
    $and: [
      { newsPublishAt: { $lt: today }, visibility: "public" },
      { $or: [
        { newsExpiredAt: { $exists : false }, },
        { newsExpiredAt: null, },
        { newsExpiredAt: { $lt: today }, }
      ] }
    ],
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return await this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestAllNews", function getLastestAllNews(pagesize?: number, startid?: string) {
  const query : FilterQuery<NewsData> = {};

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});


export default model<NewsData, NewsModel>('news', schema);