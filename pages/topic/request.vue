<template>
    <div class="p-4 w-full mx-auto">
      <div class="border-2 border-gray-200 rounded-lg shadow p-4">
        <h1 class="text-3xl font-bold text-center mb-4">
          {{ webAppName }}
        </h1>
        <h2 class="text-2xl font-bold text-center mb-4">
          Request Topic
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto my-4">
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Name</label>
            <input v-model="topicData.name" type="text" class="dga-evote-input w-0 flex-1" placeholder="Topic name" required />
            <span class="text-red-500" title="Required">*</span>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-start gap-2">
            <label class="flex-none">Description</label>
            <textarea v-model="topicData.description" class="dga-evote-input w-0 flex-1 h-32" placeholder="Description" required></textarea>
            <span class="text-red-500" title="Required">*</span>
          </div>
          <div class="p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Vote Start</label>
            <input v-model="startDateStr" type="date" class="dga-evote-input w-0 flex-1" placeholder="Start Date" />
            <input v-model="startTimeStr" type="time" class="dga-evote-input w-0 flex-1" placeholder="Start Time" />
          </div>
          <div class="p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Vote Expired</label>
            <input v-model="expiredDateStr" type="date" class="dga-evote-input w-0 flex-1" :min="startExpiredDateStr" placeholder="Expired Date"/>
            <input v-model="expiredTimeStr" type="time" class="dga-evote-input w-0 flex-1" placeholder="Expired Time"/>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Preset Choices</label>
            <select class="dga-evote-input w-0 flex-1" @change="setChoicePreset">
              <option value="yesno">Yes/No</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            Choices
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row flex-wrap items-center gap-2">
            <div v-for="(choice, i) of topicData.choices.choices" class="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.5rem)] flex flex-row items-center">
              <MaterialIcon icon="chevron_right" />
              <input :value="choice.name" type="text" class="dga-evote-input w-0 flex-1 " :class="{
                'rounded-r-none': choiceEditable && i >= 2
              }"/>
              <button v-if="choiceEditable && i >= 2" type="button" class="dga-evote-btn px-2 py-1 rounded-l-none rounded-r-md inline-flex flex-row items-center" :title="`Remove Choice [${choice.name}]`"  @click="removeOption(choice.name)">
                <MaterialIcon icon="remove" />
              </button>
            </div>
            <div v-if="choiceEditable" class="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.5rem)] flex flex-row items-center">
              <MaterialIcon icon="chevron_right" />
              <div class="flex-1 inline-flex flex-row">
                <input v-model="newChoiceValue" type="text" class="dga-evote-input w-0 flex-1 rounded-r-none" placeholder="New Choice"/>
                <button type="button" class="dga-evote-btn px-2 py-1 rounded-l-none rounded-r-md inline-flex flex-row items-center" title="Add Choice" :disabled="!isNewValueValid"  @click="addOption">
                  <MaterialIcon icon="add" />
                </button>
              </div>
            </div>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <input v-model="topicData.choices.customable" type="checkbox" :disabled="!choiceEditable" class="scale-125" />
            <label class="flex-none">Voter can custom choice</label>
          </div>
          <div class="md:col-span-2 my-2 text-center">
            <button type="button" class="dga-evote-btn w-full max-w-sm inline-flex gap-2 items-center justify-center" title="Request Topic" :disabled="!isFormValid" @click="createTopic">
              <MaterialIcon icon="ballot" />
              <span class="truncate">Request Topic</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import dayjs from "dayjs";
import { getPresetChoices, isTopicFormValid, useWatchVoteDateTimes } from "~~/src/utils/topic";
import { goBack, webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-voter"]
})

useHead({
  title: `${webAppName} - Request Topic`
});

const startDate = dayjs().millisecond(0).toDate();
const expiredDate = dayjs().add(1, "month").hour(0).minute(0).second(0).millisecond(0).toDate();

const startDateStr = ref(dayjs(startDate).format("YYYY-MM-DD"))
const startTimeStr = ref(dayjs(startDate).format("HH:MM"))
const expiredDateStr = ref(dayjs(expiredDate).format("YYYY-MM-DD"))
const expiredTimeStr = ref(dayjs(expiredDate).format("HH:MM"))
const startExpiredDateStr = computed(() => dayjs(startDateStr.value, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD"))

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  choices: getPresetChoices(),
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
});
const choiceEditable = ref(false);
const newChoiceValue = ref("");
const isNewValueValid = computed(() => {
  return newChoiceValue.value !== "" && !topicData.value.choices.choices.find((ele) => ele.name === newChoiceValue.value)
})
const isFormValid = computed(() => isTopicFormValid(topicData.value))

useWatchVoteDateTimes(topicData, startDateStr, startTimeStr, expiredDateStr, expiredTimeStr);

function setChoicePreset(payload: Event) {
  if(payload.target instanceof HTMLSelectElement) {
    topicData.value.choices = getPresetChoices(payload.target.value);
    choiceEditable.value = payload.target.value === "custom";
  }
}

function removeOption(option: string) {
  topicData.value.choices.choices = topicData.value.choices.choices.filter((ele) => ele.name !== option);
}

function addOption() {
  if(isNewValueValid.value) {
    topicData.value.choices.choices.push({ name: newChoiceValue.value });
    newChoiceValue.value = "";
  }
}

async function createTopic() {
  if(!isFormValid.value) {
    return;
  }
  
  const { data } = await useFetch("/api/topic/create", {
    method: "POST",
    body: {
      ...topicData.value,
      forcePending: true,
    },
  });

  goBack();
}
</script>