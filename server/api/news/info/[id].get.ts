import dayjs from "dayjs";
import NewsModel from "~/server/models/news"

export default defineEventHandler(async (event) => {
  const newsDoc = await NewsModel.findById(event.context.params?.id);
  if(!newsDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "News not found",
    });
  }

  const news: NewsResponseData = {
    _id: `${newsDoc._id}`,
    visibility: newsDoc.visibility,
    title: newsDoc.title,
    author: newsDoc.author,
    content: newsDoc.content,
    references: newsDoc.references,
    createdBy: newsDoc.createdBy,
    updatedBy: newsDoc.updatedBy,
    newsPublishAt: dayjs(newsDoc.newsPublishAt).toString(),
    newsExpiredAt: newsDoc.newsExpiredAt ? dayjs(newsDoc.newsExpiredAt).toString() : null,
    createdAt: dayjs(newsDoc.createdAt).toString(),
    updatedAt: dayjs(newsDoc.updatedAt).toString(),
  }
  
  return {
    news,
  }
})