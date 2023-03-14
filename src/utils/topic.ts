import dayjs from "dayjs"

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
    default:
      return {
        choices: [
          { name: "Yes" },
          { name: "No" }
        ],
        customable: false
      };
  }
}

export function isTopicFormValid(topicData: TopicFormData | TopicFormBodyData) {
  const voteStartAt = dayjs(topicData.voteStartAt);
  const voteExpiredAt = dayjs(topicData.voteExpiredAt);
  return topicData.name !== "" && topicData.description !== "" && topicData.choices.choices.every((ele) => ele.name) &&
    voteStartAt.isValid() && voteExpiredAt.isValid() && voteStartAt.valueOf() < voteExpiredAt.valueOf();
}

export function isTopicExpired(topic: TopicData | TopicResponseData) {
  return Date.now() >= dayjs(topic.voteExpiredAt).valueOf();
}

export function isTopicVoteable(topic: TopicData | TopicResponseData) {
  return topic.status === "approved" && !isTopicExpired(topic) && Date.now() >= dayjs(topic.voteStartAt).valueOf();
}