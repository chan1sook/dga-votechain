import dayjs from "dayjs"

import TopicModel from "~/src/models/topic"
import { getVotesByTopicId } from "~/src/services/fetch/vote"
import { getVoterAllowByTopicId } from "~/src/services/fetch/vote-allow"
import { isAdminRole } from "~/src/services/validations/role"
import { isTopicPause } from "~/src/services/fetch/topic-ctrl-pause"
import { isBannedUser } from "~/src/services/validations/user"
import { isUserInMatchInternalTopic } from "~/src/services/validations/topic"

export default defineEventHandler(async (event) => {  
  const topicDoc : TopicModelDataWithIdPopulated | null = await TopicModel.findById(event.context.params?.id).populate("createdBy");

  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }
  
  const topicPauseFlag = await isTopicPause(topicDoc._id);

  if(topicDoc.status !== "approved") {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not approved",
    });
  } else if(topicPauseFlag || topicDoc.voteExpiredAt.getTime() >= Date.now()) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not expired",
    });
  }

  const userData = event.context.userData;
  const [votersData, votes] = await Promise.all([
    getVoterAllowByTopicId(topicDoc._id).populate("userid"),
    getVotesByTopicId(topicDoc._id)
  ]);
  
  if(topicDoc.type !== "public") {
    let isAllowed = false;

    if(userData && !isBannedUser(userData)) {
      // check if in topicAllow
      const topicAllowDoc = votersData.find((ele) => {
        const user = (ele.userid as unknown as UserModelDataWithId);
        return user._id.toString() === userData._id.toString()
      })
      if(topicAllowDoc) {
        isAllowed = true;
      }
      
      if(topicDoc.type === "internal" && userData && isUserInMatchInternalTopic(topicDoc.internalFilter, userData)) {
        isAllowed = true
      }

      // check if is admin
      if(topicDoc.admin.toString() === userData._id.toString()) {
        isAllowed = true;
      }

      // check if is coadmins
      if(topicDoc.coadmins.find((ele) => ele.toString() === userData._id.toString())) {
        isAllowed = true;
      }
    }

    if(!isAllowed) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }
  }

  const scores : TopicVoteCountRecord[] = [];
  for(const vote of votes) {
    const target = scores.find((ele) => ele.choice === vote.choice);
    if(target) {
      target.count += 1;
    } else {
      scores.push({ choice: vote.choice, count: 1 })
    }
  }
  scores.sort((a, b) => b.count - a.count);
  
  let yourVotes: ChoiceDataType[] = [];
  if(userData && !isBannedUser(userData)) {
    const _yourVotes = votes.filter((ele) =>  ele.userid && ele.userid.toString() === userData._id.toString());
    yourVotes = _yourVotes.map((ele) => ele.choice)
  }

  const listedUserVotes = votes.filter((vote) => {
    return vote.userid && votersData.find((voter) => voter.userid._id.toString() === vote.userid?.toString());
  });

  const anonVotes = votes.filter((vote) => !listedUserVotes.includes(vote)).map((ele) => {
    return ele.userid ? ele.userid.toString() : ele.groupid;
  });
  const anonCountDistint = anonVotes.reduce((prev, current, i, arr) => {
    if(arr.indexOf(current) === i) {
      return prev + 1
    }
    return prev;
  }, 0);

  const voterTotal = votersData.length  + anonCountDistint;
  const voterVoted = voterTotal - votersData.filter((voter) => {
    return voter.remainVotes <= voter.totalVotes || votes.find((vote) => {
      if(event.context.params?.id === "649a5333dfa5bc4a4edb4943") {
        console.log(vote.userid?.toString(), voter.userid._id.toString());
      }
      return vote.userid && vote.userid.toString() === voter.userid._id.toString();
    });
  }).length;

  const voteResult : TopicResultResponse = {
    _id: `${topicDoc._id}`,
    name: topicDoc.name,
    description: topicDoc.description,
    createdBy: topicDoc.showCreator ? {
      _id: topicDoc.createdBy._id.toString(),
      firstName: topicDoc.createdBy.firstName,
      lastName: topicDoc.createdBy.lastName,
      email: topicDoc.createdBy.email,
    } : undefined,
    type: topicDoc.type,
    choices: topicDoc.choices,
    voteStartAt: dayjs(topicDoc.voteStartAt).toString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toString(),
    createdAt: dayjs(topicDoc.createdAt).toString(),
    updatedAt: dayjs(topicDoc.updatedAt).toString(),
    yourVotes: userData ? yourVotes : undefined,
    stats: {
      voters: {
        total: voterTotal,
        voted: voterVoted,
      },
      votes: {
        quota: votersData.reduce((prev, current) => current.totalVotes + prev, 0),
        anonymous: anonVotes.length,
        user: listedUserVotes.length,
      }
    },
    scores,
  }

  if(isAdminRole(userData?.roleMode)) {
    voteResult.voters = votersData.map((ele) => {
      const user = (ele.userid as unknown as UserModelDataWithId);
      return {
        user: {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        totalVotes: ele.totalVotes,
        remainVotes: ele.remainVotes,
      };
    });
  }

  return {
    voteResult,
  }
})