import dayjs from "dayjs"
import { isTopicExpired } from "~~/src/utils/topic";

import TopicModel from "~~/server/models/topic"
import VoteModel from "~~/server/models/vote"
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { getNtpNow } from "~~/server/ntp";

export default defineEventHandler(async (event) => {  
  const topicDoc = await TopicModel.findById(event.context.params?.id);
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }

  if(!topicDoc.publicVote) {
    const userData = event.context.userData;
    
    if(!userData || !checkPermissionNeeds(userData.permissions, "access-pages:user")) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }
  }

  if(topicDoc.status !== "approved" || !isTopicExpired(topicDoc, await getNtpNow())) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not expired or not approved",
    });
  }

  const allVotes = await VoteModel.find({ topicid: topicDoc._id });
  const voteRecords : Array<TopicVoteCountRecord> = [];

  for(const vote of allVotes) {
    const target = voteRecords.find((ele) => ele.choice === vote.choice);
    if(target) {
      target.count += 1;
    } else {
      voteRecords.push({ choice: vote.choice, count: 1 })
    }
  }
  allVotes.reduce((prev, current) => {
    return prev;
  }, voteRecords);

  const voteResult : TopicVoteCountResponse = {
    _id: `${topicDoc._id}`,
    name: topicDoc.name,
    description: topicDoc.description,
    choices: topicDoc.choices,
    voteStartAt: dayjs(topicDoc.voteStartAt).toString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toString(),
    createdAt: dayjs(topicDoc.createdAt).toString(),
    updatedAt: dayjs(topicDoc.updatedAt).toString(),
    winners: [],
  }

  if(topicDoc.showVotersScore) {
    if(topicDoc.showVotersChoicesPublic) {
      voteResult.votes = allVotes.map((ele) => {
        return {
          userid: ele.userid,
          createdAt: dayjs(ele.createdAt).toISOString(),
          choice: ele.choice,
          citizenId: ele.citizenId,
        };
      })
    }
    voteResult.scores = voteRecords;
  }
  const voteRecords2 = voteRecords.slice();
  const winners = [];
  voteRecords2.sort((a, b) => b.count - a.count);
  for(const vote of voteRecords2) {
    if(winners.length === 0) {
      winners.push(vote);
      continue;
    }

    if(vote.count === winners[0].count) {
      winners.push(vote);
    } else {
      break;
    }
  }

  voteResult.winners = winners.map((ele) => ele.choice);

  return {
    voteResult,
  }
})