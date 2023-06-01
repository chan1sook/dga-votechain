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

function isVoterAllowsValid(voterAllows: TopicVoterAllowFormData[]) {
  return voterAllows.length > 0 && voterAllows.every(
    (ele, i, arr) => arr.findIndex((ele2) => ele2.userid === ele.userid) === i
  );
}

function isCoadminsValid(coadmins: string[]) {
  return coadmins.every(
    (ele, i, arr) => arr.findIndex((ele2) => ele2 === ele) === i
  );
}

export function isTopicFormValid(topicData: TopicFormData | TopicFormBodyData) {
  return topicData.name !== "" && 
    isVoteDateTimeValid(topicData.voteStartAt, topicData.voteExpiredAt) && 
    isChoicesValid(topicData.choices.choices) &&
    isVoterAllowsValid(topicData.voterAllows) &&
    isCoadminsValid(topicData.coadmins);
}