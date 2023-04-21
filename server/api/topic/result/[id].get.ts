import dayjs from "dayjs"

import TopicModel from "~~/server/models/topic"
import TopicPauseModel from "~~/server/models/topic-pause"
import TopicVoterAllowModel from "~~/server/models/topic-voters-allow"
import VoteModel from "~~/server/models/vote"

export default defineEventHandler(async (event) => {  
  const topicDoc = await TopicModel.findById(event.context.params?.id);
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }
  
  const topicPauseData = await TopicPauseModel.findOne({
    topicid: topicDoc._id, resumeAt: { $exists: false }
  })

  if(topicDoc.status !== "approved") {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not approved",
    });
  } else if(topicPauseData || topicDoc.voteExpiredAt.getTime() >= Date.now()) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not expired",
    });
  }

  if(!topicDoc.publicVote) {
    const userData = event.context.userData;
    
    if(!userData) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }

    const topicAllowDoc = await TopicVoterAllowModel.findOne({
      userid: userData._id,
      topicid: topicDoc._id
    })

    if(!topicAllowDoc) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }
  }

  const allVotes : Array<VoteDataWithPopulated> = await VoteModel.find({ topicid: topicDoc._id }).populate("userid");
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
  voteRecords.sort((a, b) => b.count - a.count);

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

  if(topicDoc.showScores) {
    if(topicDoc.showVotersChoicesPublic) {
      voteResult.votes = allVotes.map((ele) => {
        return {
          userid: {
            _id: ele.userid._id.toString(),
            firstName: ele.userid.firstName,
            lastName: ele.userid.lastName,
            email: ele.userid.email,
          },
          createdAt: dayjs(ele.createdAt).toISOString(),
          choice: ele.choice,
        };
      })
    }
    voteResult.scores = voteRecords;
  }

  voteResult.winners = voteRecords.map((ele, i, arr) => {
    let rank = i + 1;
    for(let j = i - 1; j >= 0; j--) {
      if(arr[j].count === ele.count) {
        rank -= 1;
      } else {
        break;
      }
    }
    return {
      choice: ele.choice,
      rank: i + 1
    }
  });

  return {
    voteResult,
  }
})