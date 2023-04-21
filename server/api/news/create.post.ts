import dayjs from "dayjs";

import NewsModel from "~~/server/models/news"
import { getNtpTime } from "~~/server/ntp";
import { isNewsFormValid } from "~~/src/utils/news";
import { checkPermissionSelections } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionSelections(userData.permissions, "create-news")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const newsFormData: NewsFormBodyData = await readBody(event);

  const today = getNtpTime();
  const newNewsData: NewsData = {
    visibility: newsFormData.visibility,
    title: newsFormData.title,
    author: newsFormData.author,
    content: newsFormData.content,
    references: newsFormData.references,
    createdBy: userData.userid,
    updatedBy: userData.userid,
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