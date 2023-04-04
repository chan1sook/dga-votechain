import dayjs from "dayjs"
import { isThaiCitizenId } from "./utils";

export function useWatchVoteDateTimes(
  topicData: Ref<TopicFormData> | Ref<TopicFormEditData>,
  startDateStr: Ref<string>, startTimeStr: Ref<string>,
  expiredDateStr: Ref<string>, expiredTimeStr: Ref<string>
) {
  watch(startDateStr, (newValue) => {
    const voteStartAt = dayjs(`${newValue} ${startTimeStr.value}`, "YYYY-MM-DD HH:MM").toDate();
    const voteExpiredAt = dayjs(voteStartAt).add(1, "month").toDate();
  
    topicData.value.voteStartAt = voteStartAt;
    topicData.value.voteExpiredAt = voteExpiredAt;
  
    expiredDateStr.value = dayjs(voteExpiredAt).format("YYYY-MM-DD")
    expiredTimeStr.value = dayjs(voteExpiredAt).format("HH:MM")
  });
  watch(startTimeStr, (newValue) => {
    const voteStartAt = dayjs(`${startDateStr.value} ${newValue}`, "YYYY-MM-DD HH:MM").toDate();
    const voteExpiredAt = dayjs(voteStartAt).add(1, "month").toDate();
  
    topicData.value.voteStartAt = voteStartAt;
    topicData.value.voteExpiredAt = voteExpiredAt;
  
    expiredDateStr.value = dayjs(voteExpiredAt).format("YYYY-MM-DD")
    expiredTimeStr.value = dayjs(voteExpiredAt).format("HH:MM")
  });
  watch(expiredDateStr, (newValue) => {
    topicData.value.voteExpiredAt = dayjs(`${newValue} ${expiredTimeStr.value}`, "YYYY-MM-DD HH:MM").toDate();
  });
  watch(expiredTimeStr, (newValue) => {
    topicData.value.voteExpiredAt = dayjs(`${expiredDateStr.value} ${newValue}`, "YYYY-MM-DD HH:MM").toDate();
  });
}

export function useWatchVoteDateTimes2(
  voteStart: Ref<{
    dateStr: string,
    timeStr: string,
  }>,
  voteEnd: Ref<{
    dateStr: string,
    timeStr: string,
  }>,
) {
  watch(voteStart, (newValue) => {
    const voteStartAt = dayjs(`${newValue.dateStr} ${newValue.timeStr}`, "YYYY-MM-DD HH:MM").toDate();
    const voteExpiredAt = dayjs(voteStartAt).add(1, "month").toDate();
  
    voteEnd.value.dateStr = dayjs(voteExpiredAt).format("YYYY-MM-DD");
    voteEnd.value.timeStr = dayjs(voteExpiredAt).format("HH:MM");
  }, { deep: true });
}


export function getPresetChoices(value?: string) {
  switch(value) {
    case "custom":
      return {
        choices: [
          { name: "A" },
          { name: "B" },
          { name: "C" }
        ],
        customable: false
      };
    case "yesno":
      return {
        choices: [
          { name: "Yes" },
          { name: "No" }
        ],
        customable: false
      };
    default:
      return {
        choices: [],
        customable: false
      };
  }
}

export function choiceCounts(choices: ChoicesData, choice: string) {
  return choices.choices.reduce((prev, current) => {
    if(current.name === choice) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

export function voterCounts(voterAllows: Array<Omit<VoteAllowData, "remainVotes">>, citizenId: string) {
  return voterAllows.reduce((prev, current) => {
    if(current.citizenId === citizenId) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

function isVoteDateTimeValid(voteStartAt: Date | DateString, voteExpiredAt: Date | DateString) {
  const startAt = dayjs(voteStartAt);
  const expiredAt = dayjs(voteExpiredAt);
  return startAt.isValid() && expiredAt.isValid() && startAt.valueOf() < expiredAt.valueOf();
}
function isChoicesValid(choices: Array<{name: string}>) {
  return choices.length > 0 && choices.every(
    (ele, i, arr) => ele.name !== "" && 
      arr.findIndex((ele2) => ele2.name === ele.name) === i
  );
}

function isVoteAllowsValid(voterAllows: Array<Omit<VoteAllowData, "remainVotes">>) {
  return voterAllows.length > 0  && voterAllows.every(
    (ele, i, arr) => isThaiCitizenId(ele.citizenId) && 
      arr.findIndex((ele2) => ele2.citizenId === ele.citizenId) === i
  );
}

export function isTopicFormValid(topicData: TopicFormData | TopicFormBodyData) {
  return topicData.name !== "" && 
    isVoteDateTimeValid(topicData.voteStartAt, topicData.voteExpiredAt) && 
    isChoicesValid(topicData.choices.choices) &&
    isVoteAllowsValid(topicData.voterAllows);
}

export function isTopicExpired(topic: TopicData | TopicResponseData, now = Date.now()) {
  return now >= dayjs(topic.voteExpiredAt).valueOf();
}

export function isTopicVoteable(topic: TopicData | TopicResponseData, now = Date.now()) {
  return topic.status === "approved" && !isTopicExpired(topic, now) && now >= dayjs(topic.voteStartAt).valueOf();
}

export function isTopicVoted(topic: TopicData | TopicResponseData, citizenId?: string) {
  return isTopicVoteable(topic) && Array.isArray(topic.voterAllows) && topic.voterAllows.find((ele) => ele.citizenId === citizenId && ele.remainVotes === 0);
}