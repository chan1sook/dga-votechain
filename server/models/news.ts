import { FilterQuery, model, Schema, Types } from "mongoose";

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
}, { timestamps: true });

schema.static("getLastestAvaliableNews", function getLastestAvaliableNews(pagesize?: number, startid?: string) {
  const today = new Date();
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
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestAllNews", function getLastestAllNews(pagesize?: number, startid?: string) {
  const query : FilterQuery<NewsData> = {};

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});


export default model<NewsData, NewsModel>('news', schema);