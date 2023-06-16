import dayjs from "dayjs";
import { checkPermissionSelections } from "~/src/services/validations/permission";

import NewsModel from "~/server/models/news"
import { isNewsFormValid } from "~/src/utils/news";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || isBannedUser(userData)|| !checkPermissionSelections(userData.permissions, "admin-mode")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const newsFormData: NewsFormBodyData = await readBody(event);

  const today = new Date();
  const newNewsData: NewsData = {
    visibility: newsFormData.visibility,
    title: newsFormData.title,
    author: newsFormData.author,
    content: newsFormData.content,
    references: newsFormData.references,
    createdBy: userData._id,
    updatedBy: userData._id,
    createdAt: today,
    updatedAt: today,
    newsPublishAt: dayjs(newsFormData.newsPublishAt).toDate(),
    newsExpiredAt: newsFormData.newsExpiredAt ? dayjs(newsFormData.newsPublishAt).toDate() : null,
  };

  if(!isNewsFormValid(newNewsData)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Input Invalid",
    });
  }

  const newsData = await new NewsModel(newNewsData).save();
  
  const news : NewsResponseData = {
    _id: newsData._id.toString(),
    visibility: newsData.visibility,
    title: newsData.title,
    author: newsData.author,
    content: newsData.content,
    references: newsData.references,
    createdBy: newsData.createdBy,
    updatedBy: newsData.updatedBy,
    newsPublishAt: dayjs(newsData.newsPublishAt).toString(),
    newsExpiredAt: newsData.newsExpiredAt ? dayjs(newsData.newsExpiredAt).toString() : null,
    createdAt: dayjs(newsData.createdAt).toString(),
    updatedAt: dayjs(newsData.updatedAt).toString(),
  };

  return {
    news,
  }
})