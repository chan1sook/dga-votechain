import dayjs from "dayjs";
import { isBannedUser } from "./user";
import { Types } from "mongoose";

function isVoteDateTimeValid(
  voteStartAt: Date | DateString,
  voteExpiredAt: Date | DateString
) {
  const startAt = dayjs(voteStartAt);
  const expiredAt = dayjs(voteExpiredAt);
  return (
    startAt.isValid() &&
    expiredAt.isValid() &&
    startAt.valueOf() < expiredAt.valueOf()
  );
}

function isChoicesValid(choices: { name: string }[]) {
  return (
    choices.length > 0 &&
    choices.every(
      (ele, i, arr) =>
        ele.name !== "" && arr.findIndex((ele2) => ele2.name === ele.name) === i
    )
  );
}

function isVoterAllowsValid(
  voterAllows: VoterAllowFormData[],
  maxChoices?: number
) {
  return (
    voterAllows.length > 0 &&
    voterAllows.every((ele, i, arr) => {
      const notDuplicate =
        arr.findIndex((ele2) => ele2.userid === ele.userid) === i;
      const isTotalVoteValid =
        Number.isInteger(ele.totalVotes) && ele.totalVotes > 0;

      if (typeof maxChoices === "number" && Number.isInteger(maxChoices)) {
        return notDuplicate && isTotalVoteValid && ele.totalVotes <= maxChoices;
      }

      return notDuplicate && isTotalVoteValid;
    })
  );
}

function isCoadminsValid(coadmins: string[]) {
  return coadmins.every(
    (ele, i, arr) => arr.findIndex((ele2) => ele2 === ele) === i
  );
}

export function isTopicFormValid(topicData: TopicFormData | TopicFormBodyData) {
  const maxChoices =
    topicData.multipleVotes && topicData.distinctVotes
      ? topicData.choices.choices.length
      : undefined;
  let votesValid = true;
  if (isInternalTopic(topicData)) {
    votesValid =
      topicData.internalFilter.ministry !== "" &&
      (topicData.internalFilter.withDepartment
        ? topicData.internalFilter.department !== ""
        : true);
  } else if (isPrivateTopic(topicData) || !isAnonymousTopic(topicData)) {
    votesValid = isVoterAllowsValid(topicData.voterAllows, maxChoices);
  }

  return (
    topicData.name !== "" &&
    isVoteDateTimeValid(topicData.voteStartAt, topicData.voteExpiredAt) &&
    Number.isInteger(topicData.defaultVotes) &&
    topicData.defaultVotes > 0 &&
    isChoicesValid(topicData.choices.choices) &&
    votesValid &&
    isCoadminsValid(topicData.coadmins)
  );
}

export function isPublicTopic(topicData: { type: TopicType }) {
  return topicData.type === "public";
}

export function isPrivateTopic(topicData: { type: TopicType }) {
  return topicData.type === "private";
}

export function isInternalTopic(topicData: { type: TopicType }) {
  return topicData.type === "internal";
}

// Unused
export function isAnonymousTopic(topicData: {
  type: TopicType;
  anonymousVotes: boolean;
}) {
  return isPublicTopic(topicData) && topicData.anonymousVotes;
}

// Now Login only

export function isAdminOrCoadminOfTopic(
  userData: { _id: string | Types.ObjectId },
  topicData: {
    admin: string | Types.ObjectId;
    coadmins: (string | Types.ObjectId)[];
  }
) {
  // check if is admins
  if (topicData.admin.toString() === userData._id.toString()) {
    return true;
  }

  // check if is coadmins
  if (
    topicData.coadmins.find((ele) => ele.toString() === userData._id.toString())
  ) {
    return true;
  }

  return false;
}

export function isUserInMatchInternalTopic(
  internalFilter: InternalTopicVisiblityFilter,
  userData: Pick<UserSessionData, "isGovOfficer" | "ministry" | "department">
) {
  if (!userData.isGovOfficer) {
    return false;
  }

  if (internalFilter.withDepartment) {
    return (
      userData.ministry === internalFilter.ministry &&
      userData.department === internalFilter.department
    );
  } else {
    return userData.ministry === internalFilter.ministry;
  }
}

export function choiceCountOf(choices: ChoicesInfo, choice: string) {
  return choices.choices.reduce((prev, current) => {
    if (current.name === choice) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

function coadminCountOf(coadmins: CoadminFormData[], user: CoadminFormData) {
  return coadmins.reduce((prev, current) => {
    if (user.userid && current.userid === user.userid) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

export function isCoadminValid(
  coadmins: CoadminFormData[],
  coadmin: CoadminFormData
) {
  return coadminCountOf(coadmins, coadmin) < 2;
}

export function isTopicReadyToVote(
  topic: TopicModelData | TopicResponseData,
  now = Date.now()
) {
  return (
    topic.status === "approved" && now >= dayjs(topic.voteStartAt).valueOf()
  );
}

export function isTopicExpired(
  topic: TopicModelData | TopicResponseData,
  pauseLists: (TopicCtrlPauseModelData | TopicCtrlPauseResponseData)[],
  now = Date.now()
) {
  return (
    now >= dayjs(topic.voteExpiredAt).valueOf() &&
    pauseLists.every((ele) => ele.resumeAt)
  );
}

export function isCanVote(
  userData: UserSessionData | undefined,
  topicDoc: TopicModelDataWithIdPopulated,
  voterAllow: any
) {
  if (userData) {
    return (
      !isBannedUser(userData) &&
      (isAnonymousTopic(topicDoc) ||
        !!voterAllow ||
        (isInternalTopic(topicDoc) &&
          isUserInMatchInternalTopic(topicDoc.internalFilter, userData)))
    );
  } else {
    return isAnonymousTopic(topicDoc);
  }
}
