import dayjs from "dayjs";

import TopicModel from "~~/src/models/topic"
import { isTopicFormValid } from "~~/src/utils/topic";
import { checkPermissionSelections } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  if(!userData || !checkPermissionSelections(userData.permissions, "change-topic")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const topicFormData: Partial<TopicFormEditBodyData>  = await readBody(event);

  const topicData = await TopicModel.findById(event.context.params?.id);
  if(!topicData) {
    throw createError({
      statusCode: 400,
      statusMessage: "Topic not found",
    });
  }
  topicData.updatedBy = userData.userid;
  topicData.updatedAt = new Date();

  if(topicFormData.name !== undefined) {
    topicData.name = topicFormData.name;
  }

  if(topicFormData.description !== undefined) {
    topicData.description = topicFormData.description;
  }
  
  if(topicFormData.choices !== undefined) {
    topicData.choices = topicFormData.choices;
  }
  
  if(topicFormData.status !== undefined) {
    topicData.status = topicFormData.status;
  }

  if(topicFormData.voteStartAt !== undefined) {
    topicData.voteStartAt = dayjs(topicFormData.voteStartAt).toDate();
  }
  
  if(topicFormData.voteExpiredAt !== undefined) {
    topicData.voteExpiredAt = dayjs(topicFormData.voteExpiredAt).toDate();
  }

  if(!isTopicFormValid(topicData)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Input Invalid",
    });
  }

  await topicData.save();

  const topic : TopicResponseData = {
    _id: topicData._id.toString(),
    status: topicData.status,
    name: topicData.name,
    description: topicData.description,
    choices: topicData.choices,
    voteStartAt: dayjs(topicData.voteStartAt).toISOString(),
    voteExpiredAt: dayjs(topicData.voteExpiredAt).toISOString(),
    createdAt: dayjs(topicData.createdAt).toISOString(),
    updatedAt: dayjs(topicData.updatedAt).toISOString(),
  };

  return {
    topic,
  }
})