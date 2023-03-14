import dayjs from "dayjs";

import TopicModel from "~~/src/models/topic"
import { isTopicFormValid } from "~~/src/utils/topic";
import { checkPermissionNeeds, checkPermissionSelections } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionSelections(userData.permissions, "create-topic", "request-topic")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const topicFormData: TopicFormBodyData = await readBody(event);
  if(!isTopicFormValid(topicFormData)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Input Invalid",
    });
  }

  const canBypassCreate = checkPermissionNeeds(userData.permissions, "create-topic");

  const newTopicData: TopicData = {
    name: topicFormData.name,
    description: topicFormData.description,
    choices: topicFormData.choices,
    status: canBypassCreate && !topicFormData.forcePending ? "approved" : "pending",
    createdBy: userData.userid,
    updatedBy: userData.userid,
    createdAt: new Date(),
    updatedAt:  new Date(),
    voteStartAt: dayjs(topicFormData.voteStartAt).toDate(),
    voteExpiredAt: dayjs(topicFormData.voteExpiredAt).toDate(),
  };

  const topicData = await new TopicModel(newTopicData).save();
  
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