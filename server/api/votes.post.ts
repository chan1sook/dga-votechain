import dayjs from "dayjs";

import TopicModel from "~/src/models/topic"
import VoterAllowModel from "~/src/models/voters-allow"
import VoteModel from "~/src/models/vote"

import { votedEventEmitter } from "../event-emitter";
import mongoose from "mongoose";
import { addVoteOnBlockchain } from "../smart-contract";
import { isTopicPause } from "~/src/services/fetch/topic-ctrl-pause";
import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { nanoid } from "nanoid";
import { isBannedUser } from "~/src/services/validations/user";
import { isAnonymousTopic, isTopicReadyToVote, isUserInMatchInternalTopic } from "~/src/services/validations/topic";

export default defineEventHandler(async (event) => {
  const voteFormData : VotesFormData = await readBody(event);

  const topicDoc = await TopicModel.findById(voteFormData.topicid);
  if(!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }

  if(!isTopicReadyToVote(topicDoc)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not ready to vote",
    });
  }

  let voterAllowData;
  const userData = event.context.userData;

  if(userData) {
    voterAllowData = await VoterAllowModel.findOne({
      userid: userData._id,
      topicid: topicDoc._id,
    });
  }

  if(topicDoc.type === "internal" && userData && !isUserInMatchInternalTopic(topicDoc.internalFilter, userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  } else if(!isAnonymousTopic(topicDoc)) {
    if(!userData || !checkPermissionNeeds(userData.permissions, "vote-topic") ||
      userData.roleMode !== "voter" || isBannedUser(userData) || !voterAllowData
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
      });
    }
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();
  
  const topicPauseFlag = await isTopicPause(topicDoc._id);

  if(topicPauseFlag) {
    throw createError({
      statusCode: 400,
      statusMessage: "Voting Pause",
    });
  }

  const remainVotes = voterAllowData?.remainVotes || topicDoc.defaultVotes;
  if(remainVotes <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Can't vote anymore",
    });
  }
  
  if(topicDoc.multipleVotes) {
    if(voteFormData.votes.length > remainVotes) {
      voteFormData.votes = voteFormData.votes.slice(0, remainVotes);
    }
    if(voterAllowData) {
      voterAllowData.remainVotes -= voteFormData.votes.length;
    }
  } else {
    voteFormData.votes = voteFormData.votes.slice(0, 1);
    if(voterAllowData) {
      voterAllowData.remainVotes = 0;
    }
  }

  const groupid = nanoid();
  const today = new Date();
  const voteDatas : VoteModelData[] = voteFormData.votes.map((choice) => {
    return {
      userid: userData?._id,
      topicid: topicDoc._id,
      groupid: groupid,
      choice: choice,
      createdAt: today,
      updatedAt: today,
      tx: null,
    }
  });

  const [voteDocs] = await Promise.all([
    VoteModel.insertMany(voteDatas),
    voterAllowData ? voterAllowData.save() : () => {},
  ]);
  
  const votes : VoteResponseData[] = voteDocs.map((newVoteDoc) => {
    return {
      _id: `${newVoteDoc._id}`,
      userid: `${newVoteDoc.userid}`,
      topicid: `${newVoteDoc.topicid}`,
      groupid: groupid,
      choice: newVoteDoc.choice,
      createdAt: dayjs(newVoteDoc.createdAt).toString(),
      tx: newVoteDoc.tx,
    }
  });
  if(topicDoc.recoredToBlockchain) {
    await Promise.all(
      voteDocs.map(async (vote) => {
        return addVoteOnBlockchain(vote._id.toString(), vote.topicid.toString(), vote.userid ? vote.userid.toString() : "", vote.choice)
          .then((txResponse) => {
            vote.tx = txResponse.transactionHash;
            return vote.save();
          }
        ).catch(console.error)
      })
    )
  }

  await dbSession.commitTransaction();
  await dbSession.endSession();

  votedEventEmitter.emit("voted", votes);
  
  return {
    votes,
  }
})