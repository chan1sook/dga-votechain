import dayjs from "dayjs";

import TopicModel from "~/src/models/topic";
import VoterAllowModel from "~/src/models/voters-allow";
import VoteModel from "~/src/models/vote";

import { votedEventEmitter } from "../event-emitter";
import mongoose from "mongoose";
import { addVoteOnBlockchain } from "../smart-contract";
import { isTopicPause } from "~/src/services/fetch/topic-ctrl-pause";
import { nanoid } from "nanoid";
import {
  isCanVote,
  isTopicReadyToVote,
} from "~/src/services/validations/topic";
import { getVotesByTopicIdAndUserId } from "~/src/services/fetch/vote";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const voteFormData: VotesFormData = await readBody(event);

  const topicDoc = await TopicModel.findById(voteFormData.topicid);
  if (!topicDoc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not found",
    });
  }

  if (!isTopicReadyToVote(topicDoc)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Topic not ready to vote",
    });
  }

  let voterAllowData;
  let remainVotes = 0;
  const userData = event.context.userData;

  // No more Guest Access
  if (!userData || isBannedUser(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  voterAllowData = await VoterAllowModel.findOne({
    userid: userData._id,
    topicid: topicDoc._id,
  });
  if (voterAllowData) {
    remainVotes = voterAllowData.remainVotes;
  } else {
    const votes = await getVotesByTopicIdAndUserId(topicDoc._id, userData._id);
    remainVotes = topicDoc.defaultVotes - votes.length;
  }

  if (!isCanVote(userData, topicDoc, voterAllowData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const topicPauseFlag = await isTopicPause(topicDoc._id);

  if (topicPauseFlag) {
    throw createError({
      statusCode: 400,
      statusMessage: "Voting Pause",
    });
  }

  if (remainVotes <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Can't vote anymore",
    });
  }

  if (topicDoc.multipleVotes) {
    if (voteFormData.votes.length > remainVotes) {
      voteFormData.votes = voteFormData.votes.slice(0, remainVotes);
    }
    if (voterAllowData) {
      voterAllowData.remainVotes -= voteFormData.votes.length;
    }
  } else {
    voteFormData.votes = voteFormData.votes.slice(0, 1);
    if (voterAllowData) {
      voterAllowData.remainVotes = 0;
    }
  }

  const groupid = nanoid();
  const today = new Date();
  const voteDatas: VoteModelData[] = voteFormData.votes.map((choice) => {
    return {
      userid: userData?._id,
      topicid: topicDoc._id,
      groupid: groupid,
      choice: choice,
      createdAt: today,
      updatedAt: today,
      txOptional: topicDoc.recoredToBlockchain ? undefined : true,
      tx: null,
    };
  });

  const [voteDocs] = await Promise.all([
    VoteModel.insertMany(voteDatas),
    voterAllowData ? voterAllowData.save() : () => {},
  ]);

  const votes: VoteResponseData[] = voteDocs.map((newVoteDoc) => {
    return {
      _id: `${newVoteDoc._id}`,
      userid: `${newVoteDoc.userid}`,
      topicid: `${newVoteDoc.topicid}`,
      groupid: groupid,
      choice: newVoteDoc.choice,
      createdAt: dayjs(newVoteDoc.createdAt).toString(),
      tx: newVoteDoc.tx,
    };
  });
  if (topicDoc.recoredToBlockchain) {
    await Promise.all(
      voteDocs.map(async (vote) => {
        return addVoteOnBlockchain(
          vote._id.toString(),
          vote.topicid.toString(),
          vote.userid ? vote.userid.toString() : "",
          vote.choice
        )
          .then((txResponse) => {
            vote.tx = txResponse.transactionHash;
            return vote.save();
          })
          .catch(console.error);
      })
    );
  }

  await dbSession.commitTransaction();
  await dbSession.endSession();

  votedEventEmitter.emit("voted", votes);

  return {
    votes,
  };
});
