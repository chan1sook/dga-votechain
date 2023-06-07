<template>
  <div class="grid grid-cols-12 items-center gap-x-4 gap-y-2 max-w-4xl mx-auto my-4">
    <div class="col-span-12 md:col-span-2">
      {{ $t('app.topic.templateTitle') }}
    </div>
    <div class="col-span-12 md:col-span-10">
      <DgaButton color="dga-orange" @click="emit('template')">{{ $t('app.topic.useTemplate')}}</DgaButton>
    </div>
    <div class="col-span-12 md:col-span-2">
      {{ $t('app.topic.accessModifier') }}
    </div>
    <DgaSelect v-model="topicData.publicVote" class="col-span-12 md:col-span-10" :options="votePublicOptions"></DgaSelect>
    <h3 class="col-span-12 font-bold mt-2">{{ $t('app.topic.voteDuration.title')}}</h3>
    <div class="col-span-12 md:col-span-2">{{ $t('app.topic.voteDuration.inputMode')}}</div>
    <div class="col-span-12 md:col-span-10">
      <DgaSelect v-model="topicData.durationMode" :options="durationModeOptions"></DgaSelect>
    </div>
    <div class="col-span-12 md:col-span-2">{{ $t('app.topic.voteDuration.start') }}</div>
    <div class="col-span-12 md:col-span-10 flex flex-col md:flex-row gap-2">
      <VueDatePicker v-model="voteStart" is-24 teleport teleport-center :locale="i18n.locale.value" :clearable="false" :placeholder="$t('app.topic.voteDuration.startDate')" class="w-full"></VueDatePicker>
    </div>
    <template v-if="topicData.durationMode === 'startEnd'">
      <div class="col-span-12 md:col-span-2">{{ $t('app.topic.voteDuration.end')}}</div>
      <div class="col-span-12 md:col-span-10 flex flex-col md:flex-row gap-2">
        <VueDatePicker v-model="voteEnd" teleport teleport-center :min="startExpiredDateStr" is-24 :locale="i18n.locale.value" :clearable="false" :placeholder="$t('app.topic.voteDuration.endDate')" class="w-full"></VueDatePicker>
      </div>
    </template>
    <template v-else>
      <div class="col-span-12 md:col-span-2">{{ $t('app.topic.voteDuration.duration')}}</div>
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
    <h3 class="col-span-12 font-bold mt-2">{{ $t('app.topic.topicQuestion')}}</h3>
    <div class="col-span-12">
      <DgaInput
        v-model="topicData.name" type="text" 
        class="dga-evote-input w-full" :placeholder="$t('app.topic.topicQuestion')" 
        required
      >
      </DgaInput>
    </div>
    <template v-if="showDescription">
      <div class="col-span-12 md:col-span-2 self-start">{{ $t('app.description.title') }}</div>
      <div class="col-span-12 md:col-span-10">
        <DgaTextArea v-model="topicData.description" class="w-full h-32" :placeholder="$t('app.description.title')"></DgaTextArea>
      </div>
      <button  @click="showDescription = false" :title="$t('app.description.hide')" class="col-span-12 ml-auto">
        {{ $t('app.description.hide')}}
      </button>
    </template>
    <template v-else>
      <button class="col-span-12 inline-flex flex-row gap-2 items-center" :title="$t('app.description.add')" @click="showDescription = true">
        <PlusIcon /> {{ $t('app.description.add') }}
      </button>
    </template>
    <h3 class="col-span-12 font-bold mt-2">{{ $t('app.topic.addChoice.title') }}</h3>
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
            :title="`${$t('app.topic.addChoice.remove')} [${choice.name}]`"  @click="removeOption(i)"
          >
            <MinusIcon />
          </button>
        </div>
      </div>
    </div>
    <div class="col-span-12 flex justify-center items-center">
      <DgaButton color="dga-orange" class="flex flex-row gap-2 items-center" :title="$t('app.topic.addChoice.add')" 
        @click="addOption"
      >
        {{ $t('app.topic.addChoice.add') }} <PlusIcon />
      </DgaButton>
    </div>
    <h3 class="col-span-12 font-bold mt-2">{{ $t('app.voterList.title') }}</h3>
    <div class="col-span-12 flex flex-col gap-2">
      <div class="flex flex-row gap-2 items-center">
        <DgaCheckbox v-model="topicData.multipleVotes"></DgaCheckbox> 
        <label class="flex-none">{{ $t('app.voterList.multipleVotes') }}</label>
      </div>
      <div v-if="topicData.multipleVotes" class="grid grid-cols-12 gap-2 items-center">
        <div class="col-span-12 md:col-span-2">{{ $t('app.topic.defaultVotes') }}</div>
        <DgaInput v-model.number="topicData.defaultVotes" type="number" min="1" class="col-span-12 md:col-span-10"></DgaInput>
      </div>
      <div class="overflow-auto max-h-[50vh]">
        <div class="user-grid" :class="[topicData.multipleVotes ? 'multichoice' : '']">
          <div class="font-bold"></div>
          <div class="font-bold">{{ $t('app.userid') }}</div>
          <div class="font-bold">{{ $t('app.userName') }}</div>
          <div class="font-bold">{{ $t('app.email') }}</div>
          <div v-if="topicData.multipleVotes" class="font-bold">{{ $t('app.voterList.totalVotes')}}</div>
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
              <DgaInput v-model.number="voter.totalVotes"  type="number" class="w-full min-w-[100px]" :placeholder="$t('app.voterList.totalVotes')"></DgaInput>
            </div>
            <div>
              <button class="align-middle px-2 py-1 inline-flex items-center justify-center"
                :title="`${$t('app.voterList.remove')} [${getVoterName(voter)}]`"  @click="removeVoter(voter)"
              >
                <MinusIcon/>
              </button>
            </div>
          </template>
        </div>
      </div>
      <div class="w-full flex flex-row gap-2 items-center justify-center my-1">
        <DgaUserSearch class="flex-1 max-w-xl" :placeholder="$t('app.voterList.searchUser')" @select="addVoter"></DgaUserSearch>
      </div>
    </div>
    <template v-if="!noCoadmin">
      <h3 class="col-span-12 font-bold mt-2">{{ $t('app.topic.coadminList.title') }}</h3>
      <div class="col-span-12 flex flex-col gap-2">
        <div class="overflow-auto max-h-[50vh]">
          <div class="user-grid">
            <div class="font-bold"></div>
            <div class="font-bold">{{ $t('app.userid') }}</div>
            <div class="font-bold">{{ $t('app.userName') }}</div>
            <div class="font-bold">{{ $t('app.email') }}</div>
            <div></div>
            <div class="border-b-2 border-dga-blue" style="grid-column: 1/-1;"></div>
            <template v-for="admin of coadmins">
              <div>
                <ExclamationIcon
                  :class="[isCoadminValid(coadmins, admin) ? 'invisible' : '']"
                  class="text-red-500" 
                  :title="getCoadminErrorReason(admin)"
                />
              </div>
              <div>{{ admin.userid }}</div>
              <div>{{ admin.firstName ? getPrettyFullName(admin) : "-" }}</div>
              <div>{{ admin.email || "-" }}</div>
              <div>
                <button class="align-middle px-2 py-1 inline-flex items-center justify-center"
                  :title="`${$t('app.topic.coadminList.remove')} [${getPrettyFullName(admin)}]`"  @click="removeCoadmin(admin)"
                >
                  <MinusIcon />
                </button>
              </div>
            </template>
          </div>
        </div>
        <div class="w-full flex flex-row gap-2 items-center justify-center my-1">
          <DgaUserSearch admin-only not-self class="flex-1 max-w-xl" :placeholder="$t('app.topic.coadminList.searchUser')" @select="addCoadmin"></DgaUserSearch>
        </div>
      </div>
    </template>
    <div class="col-span-12 flex flex-row items-center gap-2">
      <DgaCheckbox v-model="topicData.notifyVoter"></DgaCheckbox> 
      <label class="flex-none"> {{ $t('app.topic.notifyUsers') }}</label>
    </div>
    <div class="col-span-12 flex flex-row items-center gap-2">
      <DgaCheckbox v-model="skipBlockchain"></DgaCheckbox> 
      <label class="flex-none"> {{ $t('app.topic.skipBlockchain') }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import PlusIcon from 'vue-material-design-icons/Plus.vue';
import ExclamationIcon from 'vue-material-design-icons/Exclamation.vue';
import MinusIcon from 'vue-material-design-icons/Minus.vue';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import dayjs from 'dayjs';
import { getPrettyFullName } from '~/src/services/formatter/user';
import { getDefaultChoices } from '~/src/services/form/topic';
import { choiceCountOf, isCoadminValid } from '~/src/services/validations/topic';
import { voterCountOf } from '~/src/services/validations/user';

const props = withDefaults(defineProps<{
  modelValue?: TopicFormData,
  noCoadmin?: boolean,
  voterAllows?: VoterAllowFormData[],
  coadmins?: CoadminFormData[],
}>(), {});

const emit = defineEmits<{
  (e: "update:modelValue", v: TopicFormData) : void,
  (e: "template", v: void): void,
}>();

const i18n = useI18n();

const startDate = dayjs().minute(0).second(0).millisecond(0).add(1, "hour").toDate();
const expiredDate = dayjs(startDate).add(1, "hour").minute(0).second(0).millisecond(0).toDate();

const voteStart = ref(dayjs(startDate).format("YYYY-MM-DD HH:mm"));
const voteEnd = ref(dayjs(expiredDate).format("YYYY-MM-DD HH:mm"));
const voteDuration = ref({
  durationDays: dayjs(expiredDate).diff(startDate, "days"),
  durationHours: dayjs(expiredDate).diff(startDate, "hours") % 24,
  durationMinutes: dayjs(expiredDate).diff(startDate, "minutes") % 60,
});
const startExpiredDateStr = computed(() => dayjs(voteStart.value, "YYYY-MM-DD").format("YYYY-MM-DD"));

const skipBlockchain = ref(false);
const showDescription = ref(false);
const voterAllows : Ref<VoterAllowFormData[]> = ref([]);
const coadmins : Ref<CoadminFormData[]> = ref([]);

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  choices: getDefaultChoices(),
  durationMode: "startDuration",
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  coadmins: [],
  multipleVotes: false,
  publicVote: true,
  notifyVoter: true,
  defaultVotes: 1,
  voterAllows: [],
  recoredToBlockchain: true,
});

const modelValue = computed(() => props.modelValue);
const voterAllowsRef = computed(() => props.voterAllows);
const coadminsRef = computed(() => props.coadmins);

watch(modelValue, (value) => {
  if(value) {

    topicData.value = value;

    skipBlockchain.value = !value.recoredToBlockchain;
    
    const startDate = dayjs(value.voteStartAt);
    const expiredDate = dayjs(value.voteExpiredAt);

    voteStart.value = startDate.format("YYYY-MM-DD HH:mm");
    voteEnd.value = expiredDate.format("YYYY-MM-DD HH:mm");
    voteDuration.value.durationDays = expiredDate.diff(startDate, "days"),
    voteDuration.value.durationHours = expiredDate.diff(startDate, "hours") % 24;
    voteDuration.value.durationMinutes = expiredDate.diff(startDate, "minutes") % 60;
  }
}, { deep: true, immediate: true })

watch(voterAllowsRef, (value) => {
  if(value) {
    voterAllows.value = value;
  }
}, { deep: true, immediate: true });

watch(coadminsRef, (value) => {
  if(value) {
    coadmins.value = value;
  }
}, { deep: true, immediate: true });

const votePublicOptions = computed(() => [
  { label: i18n.t('app.publicVote'), value: true },
  { label: i18n.t('app.privateVote'), value: false }
]);

const durationModeOptions = computed(() => ["startDuration", "startEnd"].map((mode) => {
  return {
    label: i18n.t(`app.topic.voteDuration.mode.${mode}`),
    value: mode
  }
}));

watch(skipBlockchain, (value) => {
  topicData.value.recoredToBlockchain = !value
}, { immediate: true })

watch(voterAllows, (value) => {
  topicData.value.voterAllows = value.map((ele) => {
    return {
      userid: ele.userid,
      totalVotes: topicData.value.multipleVotes ? ele.totalVotes : 1,
    }
  })
}, { immediate: true, deep: true })
  
watch(coadmins, (value) => {
  const result : string[] = [];
  for(const ele of value) {
    if(ele.userid) {
      result.push(ele.userid)
    }
  }
  topicData.value.coadmins = result;
}, { immediate: true, deep: true })

watch(voteStart, (value) => {
  topicData.value.voteStartAt = dayjs(value, "YYYY-MM-DD HH:mm").toDate();

  if(topicData.value.durationMode === "startDuration") {
    topicData.value.voteExpiredAt = dayjs(topicData.value.voteStartAt)
      .add(voteDuration.value.durationDays, "days")
      .add(voteDuration.value.durationHours, "hours")
      .add(voteDuration.value.durationMinutes, "minutes").toDate();
  } else {
    topicData.value.voteExpiredAt = dayjs(voteEnd.value, "YYYY-MM-DD HH:mm").toDate();
  }
}, { deep: true });

watch(voteEnd, (value) => {
  topicData.value.voteStartAt = dayjs(voteStart.value, "YYYY-MM-DD HH:mm").toDate();

  if(topicData.value.durationMode === "startDuration") {
    topicData.value.voteExpiredAt = dayjs(topicData.value.voteStartAt)
      .add(voteDuration.value.durationDays, "days")
      .add(voteDuration.value.durationHours, "hours")
      .add(voteDuration.value.durationMinutes, "minutes").toDate();
  } else {
    topicData.value.voteExpiredAt = dayjs(value, "YYYY-MM-DD HH:mm").toDate();
  }
}, { deep: true });

watch(voteDuration, (value) => {
  topicData.value.voteStartAt = dayjs(voteStart.value, "YYYY-MM-DD HH:mm").toDate();

  if(topicData.value.durationMode === "startDuration") {
    topicData.value.voteExpiredAt = dayjs(topicData.value.voteStartAt)
      .add(value.durationDays, "days")
      .add(value.durationHours, "hours")
      .add(value.durationMinutes, "minutes").toDate();
  } else {
    topicData.value.voteExpiredAt = dayjs(voteEnd.value, "YYYY-MM-DD HH:mm").toDate();
  }
}, { deep: true });

watch(topicData, (value) => {
  emit('update:modelValue', value)
}, { deep: true });

function getVoterName(voter: VoterAllowFormData) {
  return getPrettyFullName({
    ...voter,
    _id: voter.userid || "-",
  });
}

function isChoiceValid(choice: string) {
  return choice !== "" && choiceCountOf(topicData.value.choices, choice) === 1;
}

function getChoiceErrorReason(choice: string) {
  if(choice === '') {
    return i18n.t('app.topic.addChoice.error.empty');
  }

  return i18n.t('app.topic.addChoice.error.duplicated');
}

function removeOption(nth: number) {
  topicData.value.choices.choices.splice(nth, 1)
}

function addOption() {
  topicData.value.choices.choices.push({ name: "" });
}

function isVoterValid(voter: VoterAllowFormData) {
  return voterCountOf(voterAllows.value, voter) < 2 && (topicData.value.multipleVotes ? voter.totalVotes > 0 : true);
}

function getVoterErrorReason(voter: VoterAllowFormData) {
  return i18n.t('app.voterList.error.duplicated');
}

function removeVoter(user: VoterAllowFormData) {
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
      totalVotes: topicData.value.defaultVotes,
    });
  }
}

function getCoadminErrorReason(coadmin: CoadminFormData) {
  return i18n.t('app.topic.coadminList.error.duplicated');
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

<style>
.dp__theme_light {
  --dp-font-family: "Mitr", system-ui, sans-serif;
  --dp-border-radius: theme("borderRadius.2xl");
  --dp-background-color: #ffffff;
  --dp-text-color: theme('colors.dga-orange');
  --dp-hover-color: #f3f3f3;
  --dp-hover-text-color: #212121;
  --dp-hover-icon-color: #959595;
  --dp-primary-color: #1976d2;
  --dp-primary-text-color: #f8f5f5;
  --dp-secondary-color: #c0c4cc;
  --dp-border-color: theme('colors.dga-orange');
  --dp-menu-border-color: #ddd;
  --dp-border-color-hover: theme('colors.dga-orange');
  --dp-disabled-color: #f6f6f6;
  --dp-scroll-bar-background: #f3f3f3;
  --dp-scroll-bar-color: #959595;
  --dp-success-color: #76d275;
  --dp-success-color-disabled: #a3d9b1;
  --dp-icon-color: #959595;
  --dp-danger-color: #ff6f60;
  --dp-highlight-color: rgba(25, 118, 210, 0.1);
}
.dp__theme_light .dp__input  {
  border-width: 2px !important;
}
</style>