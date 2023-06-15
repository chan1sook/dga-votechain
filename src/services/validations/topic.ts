import dayjs from "dayjs";

function isVoteDateTimeValid(voteStartAt: Date | DateString, voteExpiredAt: Date | DateString) {
  const startAt = dayjs(voteStartAt);
  const expiredAt = dayjs(voteExpiredAt);
  return startAt.isValid() && expiredAt.isValid() && startAt.valueOf() < expiredAt.valueOf();
}

function isChoicesValid(choices: {name: string}[]) {
  return choices.length > 0 && choices.every(
    (ele, i, arr) => ele.name !== "" && 
      arr.findIndex((ele2) => ele2.name === ele.name) === i
  );
}

function isVoterAllowsValid(voterAllows: VoterAllowFormData[], maxChoices?: number) {
  return voterAllows.length > 0 && voterAllows.every(
    (ele, i, arr) => {
      const notDuplicate = arr.findIndex((ele2) => ele2.userid === ele.userid) === i;
      const isTotalVoteValid = Number.isInteger(ele.totalVotes) && ele.totalVotes > 0;

      if(typeof maxChoices === "number" && Number.isInteger(maxChoices)) {
        return notDuplicate && isTotalVoteValid && ele.totalVotes <= maxChoices;
      }

      return notDuplicate && isTotalVoteValid;
    }
  );
}

function isCoadminsValid(coadmins: string[]) {
  return coadmins.every(
    (ele, i, arr) => arr.findIndex((ele2) => ele2 === ele) === i
  );
}

export function isTopicFormValid(topicData: TopicFormData | TopicFormBodyData) {
  const maxChoices = topicData.multipleVotes && topicData.distinctVotes ? topicData.choices.choices.length: undefined;
  const requiredVotes = (topicData.publicVote && topicData.anonymousVotes) ? true : isVoterAllowsValid(topicData.voterAllows, maxChoices);
  
  return topicData.name !== "" && 
    isVoteDateTimeValid(topicData.voteStartAt, topicData.voteExpiredAt) && 
    Number.isInteger(topicData.defaultVotes) && topicData.defaultVotes > 0 &&
    isChoicesValid(topicData.choices.choices) &&
    requiredVotes &&
    isCoadminsValid(topicData.coadmins);
}

export function choiceCountOf(choices: ChoicesInfo, choice: string) {
  return choices.choices.reduce((prev, current) => {
    if(current.name === choice) {
      return prev + 1;
    }
    return prev;
  }, 0);
}


function coadminCountOf(coadmins: CoadminFormData[], user: CoadminFormData) {
  return coadmins.reduce((prev, current) => {
    if(user.userid && current.userid === user.userid) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

export function isCoadminValid(coadmins: CoadminFormData[], coadmin: CoadminFormData) {
  return coadminCountOf(coadmins, coadmin) < 2;
}


export function isTopicReadyToVote(topic: TopicModelData | TopicResponseData, now = Date.now()) {
  return topic.status === "approved" && now >= dayjs(topic.voteStartAt).valueOf();
}

export function isTopicExpired(topic: TopicModelData | TopicResponseData, pauseLists: (TopicCtrlPauseModelData | TopicCtrlPauseResponseData)[], now = Date.now()) {
  return now >= dayjs(topic.voteExpiredAt).valueOf() && (pauseLists.every((ele) => ele.resumeAt));
}