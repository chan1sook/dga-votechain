import dayjs from "dayjs";

import TopicModel from "~~/server/models/topic"
import NotificationModel from "~~/server/models/notification"
import { isTopicFormValid } from "~~/src/utils/topic";
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { getDigitalIdName } from "~~/src/utils/digitalid-protocol";
import { getNtpTime } from "~~/server/ntp";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || !checkPermissionNeeds(userData.permissions, "request-topic")) {
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
  const today = await getNtpTime();
  const newTopicData: TopicData = {
    name: topicFormData.name,
    description: topicFormData.description,
    choices: topicFormData.choices,
    status: "pending",
    createdBy: userData.userid,
    createdByName: getDigitalIdName(userData.digitalIdUserInfo),
    updatedBy: userData.userid,
    updatedByName: getDigitalIdName(userData.digitalIdUserInfo),
    createdAt: today,
    updatedAt: today,
    voteStartAt: dayjs(topicFormData.voteStartAt).toDate(),
    voteExpiredAt: dayjs(topicFormData.voteExpiredAt).toDate(),
    pauseDuration: 0,
    publicVote: topicFormData.publicVote,
    showVotersScore: topicFormData.showVotersScore,
    showVotersChoicesPublic: topicFormData.showVotersChoicesPublic,
    notifyVoter: topicFormData.notifyVoter,
    voterAllows: topicFormData.voterAllows.map((ele) => {
      return {
        ...ele,
        remainVotes: ele.totalVotes,
      }
    }),
  };

  const topicData = await new TopicModel(newTopicData).save();
  if(topicData.notifyVoter) {
    const today = await getNtpTime();
    await new NotificationModel(
      {
        from: "system",
        target: topicData.voterAllows.map((ele) => ({citizenId: ele.citizenId})),
        title: `Topic "${topicData.name}" Avaliable`,
        content: `Topic "${topicData.name}"  Avaliable`,
        notifyAt: topicData.voteStartAt,
        createdAt: today,
        updatedAt: today,
        tags: [`topic-${topicData._id}-avaiable`],
      }
    ).save();
  }
  
  const topic : TopicResponseData = {
    _id: topicData._id.toString(),
    status: topicData.status,
    name: topicData.name,
    description: topicData.description,
    choices: topicData.choices,
    voteStartAt: dayjs(topicData.voteStartAt).toISOString(),
    voteExpiredAt: dayjs(topicData.voteExpiredAt).toISOString(),
    pauseDuration: topicData.pauseDuration,
    createdAt: dayjs(topicData.createdAt).toISOString(),
    createdByName: topicData.createdByName,
    updatedAt: dayjs(topicData.updatedAt).toISOString(),
    updatedByName: topicData.updatedByName,
    publicVote: topicData.publicVote,
    showVotersScore: topicData.showVotersScore,
    showVotersChoicesPublic: topicData.showVotersChoicesPublic,
    notifyVoter: topicData.notifyVoter,
    voterAllows: topicData.voterAllows,
  };

  return {
    topic,
  }
})