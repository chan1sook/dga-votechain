<template>
  <div>
    <DgaHead>{{ $t('topic.create.title')  }}</DgaHead>
    <div class="grid grid-cols-12 items-center gap-x-4 gap-y-2 max-w-4xl mx-auto my-4">
      <div class="col-span-12 md:col-span-2">
        {{ $t('topic.accessModifier') }}
      </div>
      <DgaSelect v-model="topicData.publicVote" class="col-span-12 md:col-span-10" :options="votePublicOptions"></DgaSelect>
      <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.voteDuration.title')}}</h3>
      <div class="col-span-12 md:col-span-2">{{ $t('topic.voteDuration.inputMode')}}</div>
      <div class="col-span-12 md:col-span-10">
        <DgaSelect v-model="topicData.durationMode" :options="durationModeOptions"></DgaSelect>
      </div>
      <div class="col-span-12 md:col-span-2">{{ $t('topic.voteDuration.start') }}</div>
      <div class="col-span-12 md:col-span-10 flex flex-col md:flex-row gap-2">
        <DgaInput v-model="voteStart.dateStr" type="date" class="w-full" :placeholder="$t('topic.voteDuration.startDate')"></DgaInput> 
        <DgaInput v-model="voteStart.timeStr" type="time" class="w-full" :placeholder="$t('topic.voteDuration.startTime')"></DgaInput>
      </div>
      <template v-if="topicData.durationMode === 'startEnd'">
        <div class="col-span-12 md:col-span-2">{{ $t('topic.voteDuration.end')}}</div>
        <div class="col-span-12 md:col-span-10 flex flex-col md:flex-row gap-2">
          <DgaInput v-model="voteEnd.dateStr" type="date" class="w-full" :min="startExpiredDateStr" :placeholder="$t('topic.voteDuration.endDate')"></DgaInput>
          <DgaInput v-model="voteEnd.timeStr" type="time" class="w-full" :placeholder="$t('topic.voteDuration.endTime')"></DgaInput>
        </div>
      </template>
      <template v-else>
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
          <PlusIcon /> {{ $t('topic.description.add') }}
        </button>
      </template>
      <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.addChoice.title') }}</h3>
      <div v-for="choice, i of topicData.choices.choices" class="col-span-12 flex justify-center items-center">
        <div class="w-full max-w-xl flex flex-row gap-2 justify-center items-center">
          <ExclamationIcon
            :class="[isChoiceValid(choice.name) ? 'invisible' : '']" 
            class="text-red-500"
            :title="getChoiceErrorReason(choice.name)"
          />
          <div class="flex-1 inline-flex flex-row">
            <DgaInput v-model="choice.name" type="text" class="flex-1"></DgaInput>
            <button class="px-2 py-1 inline-flex items-center"
              :title="`${$t('topic.addChoice.remove')} [${choice.name}]`"  @click="removeOption(i)"
            >
              <MinusIcon />
            </button>
          </div>
        </div>
      </div>
      <div class="col-span-12 flex justify-center items-center">
        <DgaButton color="dga-orange" class="flex flex-row gap-2 items-center" :title="$t('topic.addChoice.add')" 
          @click="addOption"
        >
          {{ $t('topic.addChoice.add') }} <PlusIcon />
        </DgaButton>
      </div>
      <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.voterList.title') }}</h3>
      <div class="col-span-12 flex flex-col gap-2">
        <div class="flex flex-row gap-2 items-center">
          <DgaCheckbox v-model="topicData.multipleVotes"></DgaCheckbox> 
          <label class="flex-none">{{ $t('topic.voterList.multipleVotes') }}</label>
        </div>
        <div class="overflow-auto max-h-[50vh]">
          <div class="user-grid" :class="[topicData.multipleVotes ? 'multichoice' : '']">
            <div class="font-bold"></div>
            <div class="font-bold">{{ $t('topic.voterList.userId') }}</div>
            <div class="font-bold">{{ $t('topic.voterList.name') }}</div>
            <div class="font-bold">{{ $t('topic.voterList.email') }}</div>
            <div v-if="topicData.multipleVotes" class="font-bold">{{ $t('topic.voterList.totalVotes')}}</div>
            <div></div>
            <div class="border-b-2 border-dga-blue" style="grid-column: 1/-1;"></div>
            <template v-for="voter of voterAllows">
              <div>
                <ExclamationIcon
                  :class="[isVoterValid(voter) ? 'invisible' : '']"
                  class="text-red-500" 
                  :title="getVoterErrorReason(voter)"
                />
              </div>
              <div>{{ voter.userid }}</div>
              <div>{{ voter.firstName ? getVoterName(voter) : "-" }}</div>
              <div>{{ voter.email || "-" }}</div>
              <div v-if="topicData.multipleVotes">
                <DgaInput v-model.number="voter.totalVotes"  type="number" class="w-full min-w-[100px]" :placeholder="$t('topic.voterList.totalVotes')"></DgaInput>
              </div>
              <div>
                <button class="align-middle px-2 py-1 inline-flex items-center justify-center"
                  :title="`${$t('topic.voterList.remove')} [${getVoterName(voter)}]`"  @click="removeVoter(voter)"
                >
                  <MinusIcon />
                </button>
              </div>
            </template>
          </div>
        </div>
        <div class="w-full flex flex-row gap-2 items-center justify-center my-1">
          <DgaUserSearch class="flex-1 max-w-xl" :placeholder="$t('topic.voterList.searchUser')" @select="addVoter"></DgaUserSearch>
        </div>
      </div>
      <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.coadminList.title') }}</h3>
      <div class="col-span-12 flex flex-col gap-2">
        <div class="overflow-auto max-h-[50vh]">
          <div class="user-grid">
            <div class="font-bold"></div>
            <div class="font-bold">{{ $t('topic.coadminList.userId') }}</div>
            <div class="font-bold">{{ $t('topic.coadminList.name') }}</div>
            <div class="font-bold">{{ $t('topic.coadminList.email') }}</div>
            <div></div>
            <div class="border-b-2 border-dga-blue" style="grid-column: 1/-1;"></div>
            <template v-for="admin of coadmins">
              <div>
                <ExclamationIcon
                  :class="[isCoadminValid(admin) ? 'invisible' : '']"
                  class="text-red-500" 
                  :title="getCoadminErrorReason(admin)"
                />
              </div>
              <div>{{ admin.userid }}</div>
              <div>{{ admin.firstName ? getCoadminName(admin) : "-" }}</div>
              <div>{{ admin.email || "-" }}</div>
              <div>
                <button class="align-middle px-2 py-1 inline-flex items-center justify-center"
                  :title="`${$t('topic.coadminList.remove')} [${getCoadminName(admin)}]`"  @click="removeCoadmin(admin)"
                >
                  <MinusIcon />
                </button>
              </div>
            </template>
          </div>
        </div>
        <div class="w-full flex flex-row gap-2 items-center justify-center my-1">
          <DgaUserSearch admin-only not-self class="flex-1 max-w-xl" :placeholder="$t('topic.coadminList.searchUser')" @select="addCoadmin"></DgaUserSearch>
        </div>
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
          color="dga-orange" :title="$t('topic.create.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <PlusCircleOutlineIcon />
          <span class="truncate">{{ $t('topic.create.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="createTopic"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('topic.create.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitCreate"></DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import PlusIcon from 'vue-material-design-icons/Plus.vue';
import PlusCircleOutlineIcon from 'vue-material-design-icons/PlusCircleOutline.vue';
import MinusIcon from 'vue-material-design-icons/Minus.vue';
import ExclamationIcon from 'vue-material-design-icons/Exclamation.vue';

import dayjs from "dayjs";
import { getComputedServerTime as serverTime } from "~~/src/utils/datetime";
import { getPresetChoices, isTopicFormValid, voterCounts, choiceCounts, coadminCounts } from "~~/src/utils/topic";
import { getVoterName,  getCoadminName } from "~~/src/utils/utils";

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('topic.create.title')}`
});

const showDescription = ref(false);
const showConfirmModal = ref(false);
const waitCreate = ref(false);

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
const expiredDate = dayjs(startDate).add(1, "hour").minute(0).second(0).millisecond(0).toDate();

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
  choices: getPresetChoices(),
  durationMode: "startDuration",
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  coadmins: [],
  multipleVotes: false,
  publicVote: true,
  notifyVoter: true,
  showVotersChoicesPublic: false,
  showScores: true,
  voterAllows: [],
  recoredToBlockchain: true,
});

const skipBlockchain = ref(false);
watch(skipBlockchain, (value) => {
  topicData.value.recoredToBlockchain = !value
}, { immediate: true })

const voterAllows : Ref<Array<TopicVoterAllowFormData>> = ref([]);
watch(voterAllows, (value) => {
  topicData.value.voterAllows = value.map((ele) => {
    return {
      userid: ele.userid,
      totalVotes: ele.totalVotes,
    }
  })
}, { immediate: true, deep: true })

const coadmins : Ref<Array<CoadminFormData>> = ref([]);
watch(coadmins, (value) => {
  const result : Array<string> = [];
  for(const ele of value) {
    if(ele.userid) {
      result.push(ele.userid)
    }
  }
  topicData.value.coadmins = result;
}, { immediate: true, deep: true })

function isChoiceValid(choice: string) {
  return choice !== "" && choiceCounts(topicData.value.choices, choice) === 1;
}
function getChoiceErrorReason(choice: string) {
  if(choice === '') {
    return i18n.t('topic.addChoice.error.empty');
  }

  return i18n.t('topic.addChoice.error.duplicated');
}

function isVoterValid(voter: TopicVoterAllowFormData) {
  return voterCounts(voterAllows.value, voter) < 2 && (topicData.value.multipleVotes ? voter.totalVotes > 0 : true);
}
function getVoterErrorReason(voter: TopicVoterAllowFormData) {
  return i18n.t('topic.voterList.error.duplicated');
}

function isCoadminValid(coadmin: CoadminFormData) {
  return coadminCounts(coadmins.value, coadmin) < 2;
}
function getCoadminErrorReason(coadmin: CoadminFormData) {
  return i18n.t('topic.coadminList.error.duplicated');
}

const isFormValid = computed(() => isTopicFormValid(topicData.value))

watch(voteStart, (newValue) => {
  const voteStartAt = dayjs(`${newValue.dateStr} ${newValue.timeStr}`, "YYYY-MM-DD HH:mm").toDate();
  const voteExpiredAt = dayjs(voteStartAt).add(1, "hour").toDate();

  voteEnd.value.dateStr = dayjs(voteExpiredAt).format("YYYY-MM-DD");
  voteEnd.value.timeStr = dayjs(voteExpiredAt).format("HH:mm");
}, { deep: true });

function removeOption(nth: number) {
  topicData.value.choices.choices.splice(nth, 1)
}

function addOption() {
  topicData.value.choices.choices.push({ name: "" });
}

function removeVoter(user: TopicVoterAllowFormData) {
  const compareData = JSON.stringify(user);
  voterAllows.value = voterAllows.value.filter((ele) => {
    return compareData !== JSON.stringify(ele);
  });
}

function addVoter(user: UserSearchResponseData) {
  if(voterAllows.value.every((ele) => ele.userid !== user._id)) {
    voterAllows.value.push({
      userid: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      totalVotes: 1,
    });
  }

  return true
}

function removeCoadmin(user: CoadminFormData) {
  const compareData = JSON.stringify(user);
  coadmins.value = coadmins.value.filter((ele) => {
    return compareData !== JSON.stringify(ele);
  });
}

function addCoadmin(user: UserSearchResponseData) {
  if(coadmins.value.every((ele) => ele.userid !== user._id)) {
    coadmins.value.push({
      userid: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  }

  return true
}

async function createTopic() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitCreate.value = true;

  topicData.value.voteStartAt = dayjs(`${voteStart.value.dateStr} ${voteStart.value.timeStr}`, "YYYY-MM-DD HH:mm").toDate();
    
  if(topicData.value.durationMode === "startDuration") {
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

  const { error } = await useFetch("/api/topic/create", {
    method: "POST",
    body: {
      ...topicData.value,
      voterAllows,
    },
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('topic.create.action'),
      content: i18n.t('topic.create.failed'),
      autoCloseDelay: 5000,
    });
  
    waitCreate.value = false;
  } else {
    useShowToast({
      title: i18n.t('topic.create.action'),
      content: i18n.t('topic.create.success') ,
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/topics"))
  }
}
</script>

<style scoped>
.user-grid {
  @apply grid w-full items-center gap-x-4 pb-2 gap-y-2 whitespace-nowrap;
  grid-template-columns: 36px 2fr 4fr 3fr 36px;
}
.user-grid.multichoice {
  grid-template-columns: 36px 2fr 4fr 3fr 2fr 36px;
}
</style>