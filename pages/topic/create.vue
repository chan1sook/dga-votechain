<template>
  <div>
    <DgaHead>Create</DgaHead>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto my-4">
      <div class="md:col-span-2 flex flex-col gap-2">
        <DgaSelect v-model="topicData.publicVote" :options="votePublicOptions"></DgaSelect>
      </div>
      <div class="md:col-span-2 flex flex-col gap-2">
        <h3 class="font-bold">Vote Duration</h3>
        <div class="flex flex-row flex-wrap gap-2 items-center">
          <div>Input Mode</div>
          <DgaSelect v-model="durationMode" :options="durationModeOptions" class="flex-1"></DgaSelect>
        </div>
        <div class="flex flex-row items-center gap-2">
          <label class="flex-none">Start Vote</label>
          <DgaInput v-model="voteStart.dateStr" type="date" class="w-0 flex-1" placeholder="Start Date"></DgaInput>
          <DgaInput v-model="voteStart.timeStr" type="time" class="w-0 flex-1" placeholder="Start Time"></DgaInput>
        </div>
        <div v-if="durationMode === 'duration'" class="flex flex-row flex-wrap gap-2 items-center">
          <label class="flex-none">Set Period Time</label>
          <div class="flex-1 inline-flex flex-row items-center gap-2">
            <DgaInput type="number" v-model.number="voteDuration.durationDays" placeholder="Days" min="0" class="w-24 flex-1"></DgaInput>
            <div>D</div>
          </div>
          <div class="flex-1 inline-flex flex-row items-center gap-2">
            <DgaInput type="number" v-model.number="voteDuration.durationHours" placeholder="Hours" min="0" max="23" class="w-24 flex-1"></DgaInput>
            <div>H</div>
          </div>
          <div class="flex-1 inline-flex flex-row items-center gap-2">
            <DgaInput type="number" v-model.number="voteDuration.durationMinutes"  placeholder="Minutes" min="0" max="59" class="w-24 flex-1"></DgaInput>
            <div>M</div>
          </div>
        </div>
        <template v-else>
          <div class="flex flex-row items-center gap-2">
            <label class="flex-none">End Vote</label>
            <DgaInput v-model="voteEnd.dateStr" type="date" class="w-0 flex-1" :min="startExpiredDateStr" placeholder="Expired Date"></DgaInput>
            <DgaInput  v-model="voteEnd.timeStr" type="time" class="w-0 flex-1" placeholder="Expired Time"></DgaInput>
          </div>
        </template>
      </div>
      <div class="md:col-span-2 flex flex-row items-center gap-2">
        <label class="flex-none">Topic Question</label>
        <DgaInput
          v-model="topicData.name" type="text" 
          class="dga-evote-input w-0 flex-1" placeholder="Topic Question" 
          required
        >
        </DgaInput>
        <span class="text-red-500" title="Required">*</span>
      </div>
      <div class="md:col-span-2 flex flex-col gap-2">
        <template v-if="showDescription">
          <div class="flex flex-row items-start gap-2">
            <label class="flex-none">Description</label>
            <DgaTextArea v-model="topicData.description" class="flex-1 h-32" placeholder="Description"></DgaTextArea>
          </div>
          <button @click="showDescription = false" class="ml-auto">
            Hide Description
          </button>
        </template>
        <div v-else>
          <button class="inline-flex flex-row gap-2 items-center" @click="showDescription = true">
            <MaterialIcon icon="add"></MaterialIcon> Add Description
          </button>
        </div>
      </div>
      <div class="md:col-span-2 flex flex-col gap-2">
        <h3 class="font-bold">
          Add Choices
        </h3>
        <div v-for="choice of topicData.choices.choices" class="w-full max-w-md flex flex-row items-center">
          <MaterialIcon :class="[isOldChoiceValid(choice.name) ? 'invisible' : '']" 
            icon="priority_high" class="text-red-500"
            :title="getChoiceErrorReason(choice.name)"
          />
          <div class="flex-1 inline-flex flex-row">
            <DgaInput v-model="choice.name" type="text" class="flex-1"></DgaInput>
            <button class="px-2 py-1 inline-flex items-center justify-center"
              :title="`Remove Choice [${choice.name}]`"  @click="removeOption(choice.name)"
            >
              <MaterialIcon icon="remove" />
            </button>
          </div>
        </div>
        <div class="w-full max-w-md flex flex-row items-center">
          <MaterialIcon v-if="isNewChoiceValid" icon="emergency" />
          <MaterialIcon v-else :class="[newChoiceValue === '' ? 'invisible' : '']" icon="priority_high" class="text-red-500" :title="getChoiceErrorReason(newChoiceValue)"/>
          <div class="flex-1 inline-flex flex-row">
            <DgaInput v-model="newChoiceValue" type="text" class="flex-1" placeholder="New Choice"></DgaInput>
            <button class="px-2 py-1 inline-flex items-center justify-center" 
              title="Add Choice" :disabled="!isNewChoiceValid" @click="addOption"
            >
              <MaterialIcon icon="add" />
            </button>
          </div>
        </div>
      </div>
      <div class="md:col-span-2 flex flex-col gap-2">
        <h3 class="font-bold">Voter Lists</h3>
        <table class="table mx-auto w-full max-w-[1600px] border-spacing-0 border-collapse">
          <tbody>
            <tr>
              <th style="width: 30px"></th>
              <th>Citezen ID</th>
              <th>Available Votes</th>
              <th style="width: 30px"></th>
            </tr>
            <tr v-for="voter of topicData.voterAllows">
              <td>
                <MaterialIcon
                  :class="[isOldVoterValid(voter) ? 'invisible' : '']" icon="priority_high" class="text-red-500" 
                  :title="getVoterErrorReason(voter)"
                />
              </td>
              <td>
                <DgaInput v-model="voter.citizenId" type="text" class="w-full !rounded-r-none" placeholder="Voter Citezen Id"></DgaInput>
              </td>
              <td>
                <DgaInput v-model.number="voter.totalVotes" type="number" class="w-full !border-l-0 !rounded-l-none" placeholder="Available Vote"></DgaInput>
              </td>
              <td>
                <button class="align-middle px-2 py-1 inline-flex items-center justify-center" :title="`Remove Voter [${voter.citizenId}]`"  @click="removeVoter(voter.citizenId)">
                  <MaterialIcon icon="remove" />
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <MaterialIcon v-if="isNewVoterValid" icon="emergency" />
                <MaterialIcon v-else :class="[newVoterCitizenId === '' ? 'invisible' : '']" icon="priority_high"  class="text-red-500"
                  :title="getNewVoterErrorReason()"
                />
              </td>
              <td>
                <DgaInput v-model="newVoterCitizenId" type="text" class="w-full !rounded-r-none" placeholder="Voter Citezen Id"></DgaInput>
              </td>
              <td>
                <DgaInput v-model.number="newVoteCount" type="number" min="1" class="w-full !border-l-0 !rounded-l-none" placeholder="Available Vote"></DgaInput>
              </td>
              <td>
                <button class="align-middle px-2 py-1 inline-flex items-center justify-center" title="Add Voter" :disabled="!isNewVoterValid" @click="addVoter">
                  <MaterialIcon :class="[ !isNewVoterValid ? 'invisible' : '']" icon="add" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="md:col-span-2 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="topicData.notifyVoter"></DgaCheckbox> 
        <label class="flex-none">Send notice to user</label>
      </div>
      <div class="md:col-span-2 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="topicData.showVotersScore"></DgaCheckbox> 
        <label class="flex-none">Display result voting for public</label>
      </div>
      <div class="md:col-span-2 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="topicData.showVotersChoicesPublic" :disabled="!topicData.showVotersScore"></DgaCheckbox> 
        <label class="flex-none">Display voter choice(s) for public</label>
      </div>

      <DgaButtonGroup class="md:col-span-2 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" title="Create Topic" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <MaterialIcon icon="ballot" />
          <span class="truncate">Create Topic</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="createTopic"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      ยืนยันการสร้างคำถามการลงคะแนนนี้?
    </DgaModal>
    <DgaLoadingModal :show="waitCreate"></DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import dayjs from "dayjs";
import { getComputedServerTime as serverTime } from "~~/src/utils/datetime";
import { getPresetChoices, isTopicFormValid, voterCounts, choiceCounts } from "~~/src/utils/topic";
import { goBack, webAppName, isThaiCitizenId } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${webAppName} - Create Topic`
});

const showDescription = ref(false);
const durationMode = ref("duration");
const showConfirmModal = ref(false);
const waitCreate = ref(false);

const votePublicOptions = [{ label: "Public", value: true }, { label: "Private", value: false }];
const durationModeOptions = [{ label: "Duration", value: "duration" }, { label: "Start/End", value: "startend" }];
const defaultTotalVote = ref(1);
const startDate = dayjs(serverTime()).minute(0).second(0).millisecond(0).toDate();
const expiredDate = dayjs(serverTime()).add(1, "month").minute(0).second(0).millisecond(0).toDate();

const voteStart = ref({
  dateStr: dayjs(startDate).format("YYYY-MM-DD"),
  timeStr: dayjs(startDate).format("HH:MM"),
});
const voteEnd = ref({
  dateStr: dayjs(expiredDate).format("YYYY-MM-DD"),
  timeStr: dayjs(expiredDate).format("HH:MM"),
});
const voteDuration = ref({
  durationDays: dayjs(expiredDate).diff(startDate, "days"),
  durationHours: dayjs(expiredDate).diff(startDate, "hours") % 24,
  durationMinutes: dayjs(expiredDate).diff(startDate, "minutes") % 60,
});
const startExpiredDateStr = computed(() => dayjs(voteStart.value.dateStr, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD"));

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  choices: getPresetChoices(),
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  publicVote: true,
  notifyVoter: true,
  showVotersChoicesPublic: false,
  showVotersScore: true,
  voterAllows: [],
});

function isOldChoiceValid(choice: string) {
  return choiceCounts(topicData.value.choices, choice) === 1 && newChoiceValue.value !== choice;
}
function getChoiceErrorReason(choice: string) {
  if(choice === '') {
    return "Choice must not empty";
  }

  return "Choice Duplicated"
}

const newChoiceValue = ref("");
const isNewChoiceValid = computed(() => newChoiceValue.value !== "" && choiceCounts(topicData.value.choices, newChoiceValue.value) === 0);

function isOldVoterValid(voter: Omit<VoteAllowData, "remainVotes">) {
  return voterCounts(topicData.value.voterAllows, voter.citizenId) === 1 && newVoterCitizenId.value !== voter.citizenId && voter.totalVotes > 0;
}
function getVoterErrorReason(voter: Omit<VoteAllowData, "remainVotes">) {
  if(!isThaiCitizenId(voter.citizenId)) {
    return "Invalid Citizen ID";
  }

  return "Citizen ID Duplicated"
}
function getNewVoterErrorReason() {
  return getVoterErrorReason({ citizenId: newVoterCitizenId.value, totalVotes: newVoteCount.value });
}

const newVoterCitizenId = ref("");
const newVoteCount = ref(defaultTotalVote.value);
const isNewVoterValid = computed(() => {
  return isThaiCitizenId(newVoterCitizenId.value) &&
    voterCounts(topicData.value.voterAllows, newVoterCitizenId.value) === 0 &&
    newVoteCount.value > 0;
})
const isFormValid = computed(() => isTopicFormValid(topicData.value))

watch(voteStart, (newValue) => {
  const voteStartAt = dayjs(`${newValue.dateStr} ${newValue.timeStr}`, "YYYY-MM-DD HH:MM").toDate();
  const voteExpiredAt = dayjs(voteStartAt).add(1, "month").toDate();

  voteEnd.value.dateStr = dayjs(voteExpiredAt).format("YYYY-MM-DD");
  voteEnd.value.timeStr = dayjs(voteExpiredAt).format("HH:MM");
}, { deep: true });

function removeOption(option: string) {
  topicData.value.choices.choices = topicData.value.choices.choices.filter((ele) => ele.name !== option);
}

function addOption() {
  if(isNewChoiceValid.value) {
    topicData.value.choices.choices.push({ name: newChoiceValue.value });
    newChoiceValue.value = "";
  }
}

function removeVoter(citizenId: string) {
  topicData.value.voterAllows = topicData.value.voterAllows.filter((ele) => ele.citizenId !== citizenId);
}

function addVoter() {
  if(isNewVoterValid.value) {
    topicData.value.voterAllows.push({ citizenId: newVoterCitizenId.value, totalVotes: newVoteCount.value });
    newVoterCitizenId.value = "";
    newVoteCount.value = defaultTotalVote.value;
  }
}

async function createTopic() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitCreate.value = true;

  topicData.value.voteStartAt = dayjs(`${voteStart.value.dateStr} ${voteStart.value.timeStr}`, "YYYY-MM-DD HH:MM").toDate();
    
  if(durationMode.value === "duration") {
    topicData.value.voteExpiredAt = dayjs(topicData.value.voteStartAt)
      .add(voteDuration.value.durationDays, "days")
      .add(voteDuration.value.durationHours, "hours")
      .add(voteDuration.value.durationMinutes, "minutes").toDate();
  } else {
    topicData.value.voteExpiredAt = dayjs(`${voteEnd.value.dateStr} ${voteEnd.value.timeStr}`, "YYYY-MM-DD HH:MM").toDate();
  }
  
  const { error } = await useFetch("/api/topic/create", {
    method: "POST",
    body: topicData.value,
  });

  if(error.value) {
    useShowToast({
      title: "Add Topic",
      content: "Add Topic Failed",
      autoCloseDelay: 5000,
    });
  
    waitCreate.value = false;
  } else {
    useShowToast({
      title: "Add Topic",
      content: "Add Topic Successful",
      autoCloseDelay: 5000,
    });
    goBack();
  }
}
</script>

<style scoped>
.table th, .table td {
  padding: 0 0 6px;
}
</style>