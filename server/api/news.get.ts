import dayjs from "dayjs"

import NewsModel from "~~/server/models/news"

export default defineEventHandler(async (event) => {
  const { type, pagesize, startid } : NewsQueryParams = getQuery(event);

  let newsData: Array<NewsData> = [];

  switch(type) {
    case "available":
      newsData = await NewsModel.getLastestAvaliableNews(pagesize, startid);
      break;
    case "all":
      newsData = await NewsModel.getLastestAllNews(pagesize, startid);
      break;
    default:
      newsData = await NewsModel.getLastestAvaliableNews(pagesize, startid);
      break;
  }

  const news : Array<NewsResponseData> = newsData.map((data) => {
    return {
      _id: `${data._id}`,
      visibility: data.visibility,
      title: data.title,
      author: data.author,
      content: data.content,
      references: data.references,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      newsPublishAt: dayjs(data.newsPublishAt).toString(),
      newsExpiredAt: data.newsExpiredAt ? dayjs(data.newsExpiredAt).toString() : null,
      createdAt: dayjs(data.createdAt).toString(),
      updatedAt: dayjs(data.updatedAt).toString(),
    }
  });

  return {
    news,
  }
})