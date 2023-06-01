import dayjs from "dayjs"

export function useWatchVoteDateTimes(
  topicData: Ref<TopicFormData> | Ref<TopicFormEditData>,
  startDateStr: Ref<string>, startTimeStr: Ref<string>,
  expiredDateStr: Ref<string>, expiredTimeStr: Ref<string>
) {
  watch(startDateStr, (newValue) => {
    const voteStartAt = dayjs(`${newValue} ${startTimeStr.value}`, "YYYY-MM-DD HH:mm").toDate();
    const voteExpiredAt = dayjs(voteStartAt).add(1, "month").toDate();
  
    topicData.value.voteStartAt = voteStartAt;
    topicData.value.voteExpiredAt = voteExpiredAt;
  
    expiredDateStr.value = dayjs(voteExpiredAt).format("YYYY-MM-DD")
    expiredTimeStr.value = dayjs(voteExpiredAt).format("HH:mm")
  });
  watch(startTimeStr, (newValue) => {
    const voteStartAt = dayjs(`${startDateStr.value} ${newValue}`, "YYYY-MM-DD HH:mm").toDate();
    const voteExpiredAt = dayjs(voteStartAt).add(1, "month").toDate();
  
    topicData.value.voteStartAt = voteStartAt;
    topicData.value.voteExpiredAt = voteExpiredAt;
  
    expiredDateStr.value = dayjs(voteExpiredAt).format("YYYY-MM-DD")
    expiredTimeStr.value = dayjs(voteExpiredAt).format("HH:mm")
  });
  watch(expiredDateStr, (newValue) => {
    topicData.value.voteExpiredAt = dayjs(`${newValue} ${expiredTimeStr.value}`, "YYYY-MM-DD HH:mm").toDate();
  });
  watch(expiredTimeStr, (newValue) => {
    topicData.value.voteExpiredAt = dayjs(`${expiredDateStr.value} ${newValue}`, "YYYY-MM-DD HH:mm").toDate();
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
    const voteStartAt = dayjs(`${newValue.dateStr} ${newValue.timeStr}`, "YYYY-MM-DD HH:mm").toDate();
    const voteExpiredAt = dayjs(voteStartAt).add(1, "month").toDate();
  
    voteEnd.value.dateStr = dayjs(voteExpiredAt).format("YYYY-MM-DD");
    voteEnd.value.timeStr = dayjs(voteExpiredAt).format("HH:mm");
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

export function choiceCounts(choices: ChoicesInfo, choice: string) {
  return choices.choices.reduce((prev, current) => {
    if(current.name === choice) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

export function voterCounts(voterAllows: TopicVoterAllowFormData[], user: TopicVoterAllowFormData) {
  return voterAllows.reduce((prev, current) => {
    if(user.userid && current.userid === user.userid) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

export function coadminCounts(coadmins: CoadminFormData[], user: CoadminFormData) {
  return coadmins.reduce((prev, current) => {
    if(user.userid && current.userid === user.userid) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

export function isTopicExpired(topic: TopicResponseDataExtended, now = Date.now()) {
  return now >= dayjs(topic.voteExpiredAt).valueOf() && (topic.pauseData.every((ele) => ele.resumeAt));
}

export function isTopicReadyToVote(topic: TopicModelData | TopicResponseData, now = Date.now()) {
  return topic.status === "approved" && now >= dayjs(topic.voteStartAt).valueOf();
}