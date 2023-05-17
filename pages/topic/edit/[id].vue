<template>
  <div v-if="editable">
    <DgaHead>{{ $t('topic.edit.title')  }}</DgaHead>
    <div class="grid grid-cols-12 items-center gap-x-4 gap-y-2 max-w-4xl mx-auto my-4">
      <div class="col-span-12 md:col-span-2">
        {{ $t('topic.accessModifier') }}
      </div>
      <DgaSelect v-model="topicData.publicVote" class="col-span-12 md:col-span-10" :options="votePublicOptions"></DgaSelect>
      <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.voteDuration.title')}}</h3>
      <div class="col-span-12 md:col-span-2">{{ $t('topic.voteDuration.inputMode')}}</div>
      <div class="col-span-12 md:col-span-10">
        <DgaSelect v-model="durationMode" :options="durationModeOptions"></DgaSelect>
      </div>
      <div class="col-span-12 md:col-span-2">{{ $t('topic.voteDuration.start') }}</div>
      <div class="col-span-12 md:col-span-10 flex flex-col md:flex-row gap-2">
        <DgaInput v-model="voteStart.dateStr" type="date" class="w-full" :placeholder="$t('topic.voteDuration.startDate')"></DgaInput> 
        <DgaInput v-model="voteStart.timeStr" type="time" class="w-full" :placeholder="$t('topic.voteDuration.startTime')"></DgaInput>
      </div>
      <template v-if="durationMode === 'startDuration'">
        <div class="col-span-12 md:col-span-2">{{ $t('topic.voteDuration.duration')}}</div>
        <div class="col-span-12 md:col-span-10 flex flex-col sm:flex-row gap-2">
          <div class="w-full flex flex-row items-center gap-2">
            <DgaInput type="number" v-model.number="voteDuration.durationDays" :placeholder="$t('timePeriod.day', { count: 2})" min="0" class="w-20 flex-1"></DgaInput>
            <div class="w-16 sm:w-auto">{{ $t('timePeriod.day', { count: 2 }) }}</div>
          </div>
          <div class="w-full flex flex-row items-center gap-2">
            <DgaInput type="number" v-model.number="voteDuration.durationHours" :placeholder="$t('timePeriod.hour', { count: 2})" min="0" max="23" class="w-20 flex-1"></DgaInput>
            <div class="w-16 sm:w-auto">{{ $t('timePeriod.hour', { count: 2 }) }}</div>
          </div>
          <div class="w-full flex flex-row items-center gap-2">
            <DgaInput type="number" v-model.number="voteDuration.durationMinutes"  :placeholder="$t('timePeriod.minute', { count: 2})" min="0" max="59" class="w-20 flex-1"></DgaInput>
            <div class="w-16 sm:w-auto">{{ $t('timePeriod.minute', { count: 2 }) }}</div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="col-span-12 md:col-span-2">{{ $t('topic.voteDuration.end')}}</div>
        <div class="col-span-12 md:col-span-10 flex flex-col md:flex-row gap-2">
          <DgaInput v-model="voteEnd.dateStr" type="date" class="w-full" :min="startExpiredDateStr" :placeholder="$t('topic.voteDuration.endDate')"></DgaInput>
          <DgaInput v-model="voteEnd.timeStr" type="time" class="w-full" :placeholder="$t('topic.voteDuration.endTime')"></DgaInput>
        </div>
      </template>
      <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.topicQuestion')}}</h3>
      <div class="col-span-12">
        <DgaInput
          v-model="topicData.name" type="text" 
          class="dga-evote-input w-full" :placeholder="$t('topic.topicQuestion')" 
          required
        >
        </DgaInput>
      </div>
      <template v-if="showDescription">
        <div class="col-span-12 md:col-span-2 self-start">{{ $t('topic.description.title') }}</div>
        <div class="col-span-12 md:col-span-10">
          <DgaTextArea v-model="topicData.description" class="w-full h-32" :placeholder="$t('topic.description.title')"></DgaTextArea>
        </div>
        <button  @click="showDescription = false" :title="$t('topic.description.hide')" class="col-span-12 ml-auto">
          {{ $t('topic.description.hide')}}
        </button>
      </template>
      <template v-else>
        <button class="col-span-12 inline-flex flex-row gap-2 items-center" :title="$t('topic.description.add')" @click="showDescription = true">
          <MaterialIcon icon="add"></MaterialIcon> {{ $t('topic.description.add') }}
        </button>
      </template>
      <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.addChoice.title') }}</h3>
      <div v-for="choice, i of topicData.choices.choices" class="col-span-12 flex justify-center items-center">
        <div class="w-full max-w-xl flex flex-row gap-2 justify-center items-center">
          <MaterialIcon :class="[isChoiceValid(choice.name) ? 'invisible' : '']" 
            icon="priority_high" class="text-red-500"
            :title="getChoiceErrorReason(choice.name)"
          />
          <div class="flex-1 inline-flex flex-row">
            <DgaInput v-model="choice.name" type="text" class="flex-1"></DgaInput>
            <button class="px-2 py-1 inline-flex items-center"
              :title="`${$t('topic.addChoice.remove')} [${choice.name}]`"  @click="removeOption(i)"
            >
              <MaterialIcon icon="remove" />
            </button>
          </div>
        </div>
      </div>
      <div class="col-span-12 flex justify-center items-center">
        <DgaButton color="dga-orange" class="flex flex-row gap-2 items-center" :title="$t('topic.addChoice.add')" 
          @click="addOption"
        >
          {{ $t('topic.addChoice.add') }} <MaterialIcon icon="add" />
        </DgaButton>
      </div>
      <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.voterList.title') }}</h3>
      <div class="col-span-12 flex flex-col gap-2">
        <div class="flex flex-row gap-2 items-center">
          <DgaCheckbox v-model="topicData.multipleVotes"></DgaCheckbox> 
          <label class="flex-none">{{ $t('topic.voterList.multipleVotes') }}</label>
        </div>
        <table class="table mx-auto w-full max-w-[1600px] border-spacing-0 border-collapse">
          <tbody>
            <tr class="border-b-2 border-dga-blue">
              <th style="width: 30px"></th>
              <th style="width: 180px">{{ $t('topic.voterList.userId') }}</th>
              <th>{{ $t('topic.voterList.name') }}</th>
              <th>{{ $t('topic.voterList.email') }}</th>
              <th v-if="topicData.multipleVotes">{{ $t('topic.voterList.totalVotes')}}</th>
              <th style="width: 30px"></th>
            </tr>
            <tr v-for="voter of voterAllowsWithHint" class="transition hover:bg-slate-200">
              <td>
                <MaterialIcon
                  :class="[isVoterValid(voter) ? 'invisible' : '']" icon="priority_high" class="text-red-500" 
                  :title="getVoterErrorReason(voter)"
                />
              </td>
              <td>
                {{ voter.userid }}
              </td>
              <td>
                {{ voter.firstName ? getVoterName(voter) : "-" }}
              </td>
              <td>
                {{ voter.email || "-" }}
              </td>
              <td v-if="topicData.multipleVotes">
                <DgaInput v-model.number="voter.totalVotes"  type="number" class="w-full" :placeholder="$t('topic.voterList.totalVotes')"></DgaInput>
              </td>
              <td>
                <button class="align-middle px-2 py-1 inline-flex items-center justify-center"
                  :title="`${$t('topic.voterList.remove')} [${getVoterName(voter)}]`"  @click="removeVoter(voter.userid)"
                >
                  <MaterialIcon icon="remove" />
                </button>
              </td>
            </tr>
            <tr>
              <td :colspan="topicData.multipleVotes ? 6 : 5">
                <div class="flex flex-row gap-2 items-center my-1">
                  <DgaUserSearch class="flex-1" :placeholder="$t('topic.voterList.searchUser')" @select="addVoter"></DgaUserSearch>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-span-12 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="topicData.notifyVoter"></DgaCheckbox> 
        <label class="flex-none"> {{ $t('topic.notifyUsers') }}</label>
      </div>
      <div class="col-span-12 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="topicData.showScores"></DgaCheckbox> 
        <label class="flex-none"> {{ $t('topic.showScores') }}</label>
      </div>
      <div class="col-span-12 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="skipBlockchain"></DgaCheckbox> 
        <label class="flex-none"> {{ $t('topic.skipBlockchain') }}</label>
      </div>
      <div class="col-span-12 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="topicData.showVotersChoicesPublic" :disabled="!topicData.showScores"></DgaCheckbox> 
        <label class="flex-none">{{ $t('topic.voterScorePublic') }}</label>
      </div>
      
      <DgaButtonGroup class="col-span-12 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('topic.edit.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <MaterialIcon icon="ballot" />
          <span class="truncate">{{ $t('topic.edit.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="editTopic"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('topic.edit.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { getComputedServerTime, getComputedServerTime as serverTime } from "~~/src/utils/datetime";
import { getPresetChoices, isTopicFormValid, voterCounts, choiceCounts, isTopicReadyToVote } from "~~/src/utils/topic";
import { getVoterName } from "~~/src/utils/utils";

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${i18n.t('appName', 'Dga E-Voting')} - ${i18n.t('topic.edit.title')}`
});

const { id: topicid } = useRoute().params;

const editable = ref(false);
const showDescription = ref(false);
const durationMode = ref("startDuration");
const showConfirmModal = ref(false);
const waitEdit = ref(false);

const votePublicOptions = computed(() => [
  { label: i18n.t('topic.publicVoteAccess'), value: true },
  { label: i18n.t('topic.privateVoteAccess'), value: false }
]);
const durationModeOptions = computed(() => ["startDuration", "startEnd"].map((mode) => {
  return {
    label: i18n.t(`topic.voteDuration.mode.${mode}`),
    value: mode
  }
}));

const startDate = dayjs(serverTime()).minute(0).second(0).millisecond(0).add(1, "hour").toDate();
const expiredDate = dayjs(startDate).add(1, "month").minute(0).second(0).millisecond(0).toDate();

const voteStart = ref({
  dateStr: dayjs(startDate).format("YYYY-MM-DD"),
  timeStr: dayjs(startDate).format("HH:mm"),
});
const voteEnd = ref({
  dateStr: dayjs(expiredDate).format("YYYY-MM-DD"),
  timeStr: dayjs(expiredDate).format("HH:mm"),
});
const voteDuration = ref({
  durationDays: dayjs(expiredDate).diff(startDate, "days"),
  durationHours: dayjs(expiredDate).diff(startDate, "hours") % 24,
  durationMinutes: dayjs(expiredDate).diff(startDate, "minutes") % 60,
});
const startExpiredDateStr = computed(() => dayjs(voteStart.value.dateStr, "YYYY-MM-DD").format("YYYY-MM-DD"));

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  multipleVotes: false,
  choices: getPresetChoices(),
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  publicVote: true,
  notifyVoter: true,
  showVotersChoicesPublic: false,
  showScores: true,
  voterAllows: [],
  recoredToBlockchain: true,
});

const voterAllowsWithHint : Ref<Array<TopicVoterAllowFormDataWithHint>> = ref([]);
watch(voterAllowsWithHint, (value) => {
  topicData.value.voterAllows = value.map((ele) => {
    return {
      userid: ele.userid,
      totalVotes: ele.totalVotes,
    }
  })
}, { immediate: true, deep: true })

const { data } = await useFetch(`/api/topic/info-admin/${topicid}`);
if (!data.value) {
  showError(i18n.t('topic.error.notFound'));
} else if(isTopicReadyToVote(data.value.topic, getComputedServerTime().getTime())) {
  showError(i18n.t('topic.error.notEditable'));
} else {
  const { topic, voterAllows } = data.value;
  const startDate = dayjs(topic.voteStartAt).toDate();
  const expiredDate = dayjs(topic.voteExpiredAt).toDate();

  topicData.value.name = topic.name;
  topicData.value.description = topic.description;
  topicData.value.choices = topic.choices;
  topicData.value.voteStartAt = startDate;
  topicData.value.voteExpiredAt = expiredDate;
  topicData.value.publicVote = topic.publicVote;
  topicData.value.showVotersChoicesPublic = topic.showVotersChoicesPublic;
  topicData.value.showScores = topic.showScores;
  topicData.value.recoredToBlockchain = topic.recoredToBlockchain;
  topicData.value.notifyVoter = topic.notifyVoter === true;
  topicData.value.multipleVotes = topic.multipleVotes;
  voterAllowsWithHint.value = voterAllows;
    
  voteStart.value.dateStr = dayjs(startDate).format("YYYY-MM-DD");
  voteStart.value.timeStr = dayjs(startDate).format("HH:mm");
  voteEnd.value.dateStr = dayjs(expiredDate).format("YYYY-MM-DD");
  voteEnd.value.timeStr = dayjs(expiredDate).format("HH:mm");
  voteDuration.value.durationDays = dayjs(expiredDate).diff(startDate, "days"),
  voteDuration.value.durationHours = dayjs(expiredDate).diff(startDate, "hours") % 24;
  voteDuration.value.durationMinutes = dayjs(expiredDate).diff(startDate, "minutes") % 60;

  editable.value = true;
}

const skipBlockchain = ref(false);
watch(skipBlockchain, (value) => {
  topicData.value.recoredToBlockchain = !value
}, { immediate: true })

function isChoiceValid(choice: string) {
  return choice !== "" && choiceCounts(topicData.value.choices, choice) === 1;
}
function getChoiceErrorReason(choice: string) {
  if(choice === '') {
    return i18n.t('topic.addChoice.error.empty');
  }

  return i18n.t('topic.addChoice.error.duplicated');
}

function isVoterValid(voter: TopicVoterAllowFormDataWithHint) {
  return voterCounts(voterAllowsWithHint.value, voter.userid) < 2 && (topicData.value.multipleVotes ? voter.totalVotes > 0 : true);
}
function getVoterErrorReason(voter: TopicVoterAllowFormDataWithHint) {
  return i18n.t('topic.voterList.error.duplicated');
}

const isFormValid = computed(() => isTopicFormValid(topicData.value))

watch(voteStart, (newValue) => {
  const voteStartAt = dayjs(`${newValue.dateStr} ${newValue.timeStr}`, "YYYY-MM-DD HH:mm").toDate();
  const voteExpiredAt = dayjs(voteStartAt).add(1, "month").toDate();

  voteEnd.value.dateStr = dayjs(voteExpiredAt).format("YYYY-MM-DD");
  voteEnd.value.timeStr = dayjs(voteExpiredAt).format("HH:mm");
}, { deep: true });

function removeOption(nth: number) {
  topicData.value.choices.choices.splice(nth, 1)
}

function addOption() {
  topicData.value.choices.choices.push({ name: "" });
}

function removeVoter(userid: string) {
  voterAllowsWithHint.value = voterAllowsWithHint.value.filter((ele) => ele.userid !== userid);
}

function addVoter(user: UserSearchResponseData) {
  if(voterAllowsWithHint.value.every((ele) => ele.userid !== user._id)) {
    voterAllowsWithHint.value.push({
      userid: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      totalVotes: 1,
    });
  }

  return true
}

async function editTopic() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitEdit.value = true;

  topicData.value.voteStartAt = dayjs(`${voteStart.value.dateStr} ${voteStart.value.timeStr}`, "YYYY-MM-DD HH:mm").toDate();
    
  if(durationMode.value === "startDuration") {
    topicData.value.voteExpiredAt = dayjs(topicData.value.voteStartAt)
      .add(voteDuration.value.durationDays, "days")
      .add(voteDuration.value.durationHours, "hours")
      .add(voteDuration.value.durationMinutes, "minutes").toDate();
  } else {
    topicData.value.voteExpiredAt = dayjs(`${voteEnd.value.dateStr} ${voteEnd.value.timeStr}`, "YYYY-MM-DD HH:mm").toDate();
  }
  
  const voterAllows = topicData.value.voterAllows.map((ele) => {
    return {
      userid: ele.userid,
      totalVotes: topicData.value.multipleVotes ? ele.totalVotes : 1,
    }
  });

  const { error } = await useFetch(`/api/topic/edit/${topicid}`, {
    method: "POST",
    body: {
      ...topicData.value,
      voterAllows,
    },
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('topic.edit.action'),
      content: i18n.t('topic.edit.failed'),
      autoCloseDelay: 5000,
    });
  
    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t('topic.edit.action'),
      content: i18n.t('topic.edit.success') ,
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/topics"))
  }
}
</script>

<style scoped>
.table th, .table td {
  @apply py-3 px-2;
}
</style>