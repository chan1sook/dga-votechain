import dayjs from "dayjs";

import {
  getLastestAdminTopics,
  getLastestDevTopics,
  getLastestGuestTopics,
  getLastestVoterTopicsWithIds,
} from "~/src/services/fetch/topics";
import { getVoterAllowByUserId } from "~/src/services/fetch/vote-allow";
import { getTopicCtrlPauseListByTopicIds } from "~/src/services/fetch/topic-ctrl-pause";
import { isBannedUser } from "~/src/services/validations/user";
import { getVotesByTopicIdsAndUserId } from "~/src/services/fetch/vote";
import { isCanVote } from "~/src/services/validations/topic";
import { isUserAdmin, isUserDeveloper } from "~/src/services/validations/role";

export default defineEventHandler(async (event) => {
  const { filter, roleMode } = getQuery(event);
  let topicsData: TopicModelDataWithIdPopulated[] = [];
  let filterParams: TopicFilterParams = { type: "all", topicType: "all" };
  if (typeof filter === "string") {
    try {
      filterParams = JSON.parse(filter);
    } catch (err) {
      console.error(err);
    }
  }

  const userData = event.context.userData;
  const topicVoterAllowsDocs =
    userData && !isBannedUser(userData)
      ? await getVoterAllowByUserId(
          userData._id,
          filterParams?.pagesize,
          filterParams?.startid
        )
      : [];
  let filterIds;
  if (!userData || isBannedUser(userData)) {
    // No more Guest Access
    // topicsData = await getLastestGuestTopics(filterParams).populate(
    //   "createdBy"
    // );
  } else if (roleMode === "admin" && isUserAdmin(userData)) {
    topicsData = await getLastestAdminTopics(
      userData._id,
      filterParams
    ).populate("createdBy");
  } else if (roleMode === "developer" && isUserDeveloper(userData)) {
    topicsData = await getLastestDevTopics(filterParams).populate("createdBy");
  } else {
    filterIds = topicVoterAllowsDocs
      .map((ele) => ele.topicid)
      .filter((ele, i, arr) => arr.indexOf(ele) === i);
    topicsData = await getLastestVoterTopicsWithIds(
      filterIds,
      userData,
      filterParams
    ).populate("createdBy");
  }

  const topicPauseDocs = await getTopicCtrlPauseListByTopicIds(
    topicsData.map((ele) => ele._id)
  );
  const votesDoc = userData
    ? await getVotesByTopicIdsAndUserId(
        topicsData.map((ele) => ele._id),
        userData._id
      )
    : [];

  const topics = topicsData.map<TopicResponseDataExtended>((topicData, i) => {
    const topicAllowDoc = topicVoterAllowsDocs.find(
      (voterAllow) => `${voterAllow.topicid._id}` === `${topicData._id}`
    );
    const filterVotes = votesDoc.filter(
      (ele) => ele.topicid.toString() === topicData._id.toString()
    );

    const quota = topicAllowDoc
      ? topicAllowDoc.totalVotes
      : topicData.defaultVotes;
    const voted = filterVotes.length;

    const canVote = isCanVote(userData, topicData, topicAllowDoc);

    const topicPauseArr = topicPauseDocs.filter(
      (ele) => `${ele.topicid._id}` === `${topicData._id}`
    );

    return {
      _id: topicData._id.toString(),
      status: topicData.status,
      name: topicData.name,
      description: topicData.description,
      type: topicData.type,
      internalFilter: topicData.internalFilter,
      multipleVotes: topicData.multipleVotes,
      distinctVotes: topicData.distinctVotes,
      choices: topicData.choices,
      createdBy: topicData.showCreator
        ? {
            _id: topicData.createdBy._id.toString(),
            firstName: topicData.createdBy.firstName,
            lastName: topicData.createdBy.lastName,
            email: topicData.createdBy.email,
          }
        : undefined,
      updatedBy: topicData.updatedBy.toString(),
      admin: topicData.admin.toString(),
      coadmins: topicData.coadmins.map((ele) => {
        return ele.toString();
      }),
      createdAt: dayjs(topicData.createdAt).toISOString(),
      updatedAt: dayjs(topicData.updatedAt).toISOString(),
      durationMode: topicData.durationMode,
      voteStartAt: dayjs(topicData.voteStartAt).toISOString(),
      voteExpiredAt: dayjs(topicData.voteExpiredAt).toISOString(),
      anonymousVotes: topicData.anonymousVotes,
      showCreator: topicData.showCreator,
      recoredToBlockchain: topicData.recoredToBlockchain,
      canVote: canVote,
      quota: quota,
      voted: voted,
      pauseData: topicPauseArr.map((ele) => {
        return {
          topicid: topicData._id.toString(),
          pauseAt: dayjs(ele.pauseAt).toISOString(),
          cause: ele.cause,
          resumeAt: ele.resumeAt
            ? dayjs(ele.resumeAt).toISOString()
            : undefined,
        };
      }),
      notifyVoter: topicData.notifyVoter,
      defaultVotes: topicData.defaultVotes,
      hidden: topicData.hidden,
    };
  });

  return {
    topics,
  };
});
