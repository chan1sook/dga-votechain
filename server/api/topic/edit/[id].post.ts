import dayjs from "dayjs";

import TopicModel from "~~/server/models/topic"
import NotificationModel from "~~/server/models/notification"
import { isTopicFormValid } from "~~/src/utils/topic";
import { checkPermissionSelections } from "~~/src/utils/permissions";
import { getDigitalIdName } from "~~/src/utils/digitalid-protocol";
import { getNtpTime } from "~~/server/ntp";

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
  topicData.updatedAt = await getNtpTime();
  topicData.updatedByName = getDigitalIdName(userData.digitalIdUserInfo);

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

  if(topicFormData.publicVote !== undefined) {
    topicData.publicVote = topicFormData.publicVote;
  }

  if(topicFormData.showVotersScore !== undefined) {
    topicData.showVotersScore = topicFormData.showVotersScore;
  }

  if(topicFormData.showVotersChoicesPublic !== undefined) {
    topicData.showVotersChoicesPublic = topicFormData.showVotersChoicesPublic;
  }

  if(topicFormData.notifyVoter !== undefined) {
    topicData.notifyVoter = topicFormData.notifyVoter;
  }

  if(topicFormData.voterAllows !== undefined) {
    topicData.voterAllows = topicFormData.voterAllows.map((ele) => {
      return {
        ...ele,
        remainVotes: ele.totalVotes,
      }
    });
  }

  if(!isTopicFormValid(topicData)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Input Invalid",
    });
  }

  await topicData.save();
  if(topicData.notifyVoter) {
    await NotificationModel.findOneAndUpdate({
      tags: `topic-${topicData._id}-access`
    }, {
      $set: {
        target: topicData.voterAllows,
        title: `Topic "${topicData.name}" Avaliable`,
        content: `Topic "${topicData.name}"  Avaliable`,
        notifyAt: topicData.voteStartAt,
      }
    });
  } else {
    await NotificationModel.findOneAndDelete({
      tags: `topic-${topicData._id}-access`
    });
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