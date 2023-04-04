import dayjs from "dayjs";
import TopicModel from "~~/server/models/topic"
import VoteModel from "~~/server/models/vote"
import { getNtpNow } from "~~/server/ntp";
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { isTopicExpired } from "~~/src/utils/topic";

export default defineEventHandler(async (event) => {
  const { withVotes } : { withVotes?: string } = getQuery(event);

  const topicDoc = await TopicModel.findById(event.context.params?.id);
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }

  const topic : TopicResponseData = {
    _id: topicDoc._id.toString(),
    status: topicDoc.status,
    name: topicDoc.name,
    description: topicDoc.description,
    choices: topicDoc.choices,
    voteStartAt: dayjs(topicDoc.voteStartAt).toISOString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toISOString(),
    pauseDuration: topicDoc.pauseDuration,
    createdAt: dayjs(topicDoc.createdAt).toISOString(),
    createdByName: topicDoc.createdByName,
    updatedAt: dayjs(topicDoc.updatedAt).toISOString(),
    updatedByName: topicDoc.updatedByName,
    publicVote: topicDoc.publicVote,
    showVotersScore: topicDoc.showVotersScore,
    showVotersChoicesPublic: topicDoc.showVotersChoicesPublic,
    notifyVoter: topicDoc.notifyVoter,
    voterAllows: topicDoc.voterAllows,
  };

  let existsVotes : Array<VoteResponseData> | undefined;
  let remainVotes : number | undefined;

  if(withVotes && !isTopicExpired(topicDoc, await getNtpNow())) {
    const userData = event.context.userData;
    if(userData && checkPermissionNeeds(userData.permissions, "vote-topic")) {
      const voteAllowData = topicDoc.voterAllows.find((ele) => ele.citizenId === userData.digitalIdUserInfo.citizen_id);
      if(voteAllowData) {
        const voteDocs = await VoteModel.find({ userid: userData.userid, topicid: topicDoc._id });
        existsVotes = voteDocs.map((voteDoc) => {
          return {
            _id: `${voteDoc._id}`,
            userid: userData.userid,
            citizenId: voteDoc.citizenId,
            topicid: `${topic._id}`,
            choice: voteDoc.choice,
            createdAt: dayjs(voteDoc.createdAt).toString()
          }
        });
        remainVotes = voteAllowData?.remainVotes || 0;
      }
    }
  }
  
  return {
    topic,
    existsVotes,
    remainVotes,
  }
})