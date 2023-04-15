import { Model, Types, Query, Document } from "mongoose";

declare global {
  type NewsVisiblity = 'public' | 'private'; 
  interface NewsData {
    _id?: Types.ObjectId,
    visibility: NewsVisiblity,
    title: string,
    author: string,
    content: string,
    references: string,
    createdBy: DigitalIDUserId,
    updatedBy: DigitalIDUserId,
    newsPublishAt: Date,
    newsExpiredAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  }

  interface NewsModel extends Model<NewsData> {
    getLastestAvaliableNews(pagesize?: number, startid?: string) : Query<Array<NewsData>, NewsData>;
    getLastestAllNews(pagesize?: number, startid?: string) : Query<Array<NewsData>, NewsData>;
  }

  type NewsFormData = Omit<NewsData, "_id"  | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">;
  type NewsFormBodyData = Omit<NewsFormData, "newsPublishAt" | "newsExpiredAt"> & {
    newsPublishAt: DateString,
    newsExpiredAt: DateString | null,
  }

  type NewsFormEditData = NewsFormData;
  type NewsFormEditBodyData = NewsFormBodyData;

  type NewsResponseData = NewsFormBodyData & Pick<NewsData, "createdBy" | "updatedBy"> & {
    _id: string,
    createdAt: DateString,
    updatedAt: DateString,
  }


  type NewsQueryType = "available" | "all";
  type NewsQueryParams = PaginationParams & {
    type?: NewsQueryType,
  }
}