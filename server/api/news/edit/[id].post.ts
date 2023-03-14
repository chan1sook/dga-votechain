import dayjs from "dayjs";

import NewsModel from "~~/src/models/news"
import { isNewsFormValid } from "~~/src/utils/news";
import { checkPermissionSelections } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  if(!userData || !checkPermissionSelections(userData.permissions, "change-news")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const topicFormData: Partial<NewsFormEditBodyData>  = await readBody(event);

  const newsData = await NewsModel.findById(event.context.params?.id);
  if(!newsData) {
    throw createError({
      statusCode: 400,
      statusMessage: "News not found",
    });
  }
  newsData.updatedBy = userData.userid;
  newsData.updatedAt = new Date();

  if(topicFormData.visibility !== undefined) {
    newsData.visibility = topicFormData.visibility;
  }

  if(topicFormData.title !== undefined) {
    newsData.title = topicFormData.title;
  }

  if(topicFormData.content !== undefined) {
    newsData.content = topicFormData.content;
  }

  if(topicFormData.author !== undefined) {
    newsData.author = topicFormData.author;
  }

  if(topicFormData.references !== undefined) {
    newsData.references = topicFormData.references;
  }

  if(topicFormData.newsPublishAt !== undefined) {
    newsData.newsPublishAt = dayjs(topicFormData.newsPublishAt).toDate();
  }
  
  if(topicFormData.newsExpiredAt !== undefined) {
    newsData.newsExpiredAt = topicFormData.newsExpiredAt ? dayjs(topicFormData.newsExpiredAt).toDate() : null;
  }

  if(!isNewsFormValid(newsData)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Input Invalid",
    });
  }

  await newsData.save();

  const news : NewsResponseData = {
    _id: `${newsData._id}`,
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