<template>
  <div
    class="mx-auto my-4 grid max-w-4xl grid-cols-12 items-center gap-x-4 gap-y-2"
  >
    <div class="col-span-12 md:col-span-2">
      {{ $t("app.topic.templateTitle") }}
    </div>
    <div class="col-span-12 md:col-span-10">
      <DgaButton color="dga-orange" @click="emit('template')">{{
        $t("app.topic.useTemplate")
      }}</DgaButton>
    </div>
    <div class="col-span-12 md:col-span-2">
      {{ $t("app.topic.accessModifier") }}
    </div>
    <DgaVueSelect
      v-model="topicData.type"
      class="col-span-12 md:col-span-10"
      :options="votePublicOptions"
      :reduce="(val) => val.value"
    ></DgaVueSelect>
    <div class="col-span-12 flex flex-col gap-2">
      <div
        v-if="topicData.type === 'public'"
        class="flex flex-row items-center gap-2"
      >
        <DgaCheckbox v-model="topicData.anonymousVotes"></DgaCheckbox>
        <label class="flex-none">{{ $t("app.topic.anonymousVotes") }}</label>
        <button
          type="button"
          @click="showInputHintModal = 'anonymousVotes'"
          :title="$t('app.detail')"
        >
          <InformationIcon />
        </button>
      </div>
      <template v-else-if="topicData.type === 'internal'">
        <div class="flex flex-row items-center gap-2">
          <DgaMinistryVueSelect
            class="w-full"
            v-model="topicData.internalFilter.ministry"
          >
          </DgaMinistryVueSelect>
        </div>
        <div class="flex flex-row items-center gap-2">
          <DgaCheckbox
            v-model="topicData.internalFilter.withDepartment"
          ></DgaCheckbox>
          <label class="flex-none">{{ $t("app.topic.withDepartment") }}</label>
        </div>
        <div
          v-if="topicData.internalFilter.withDepartment"
          class="flex flex-row items-center gap-2"
        >
          <DgaInput
            v-model="topicData.internalFilter.department"
            class="w-full"
            :placeholder="$t('app.department')"
          >
          </DgaInput>
        </div>
      </template>
      <div class="flex flex-row items-center gap-2">
        <DgaCheckbox v-model="topicData.multipleVotes"></DgaCheckbox>
        <label class="flex-none">{{ $t("app.voterList.multipleVotes") }}</label>
        <button
          type="button"
          @click="showInputHintModal = 'multipleVotes'"
          :title="$t('app.detail')"
        >
          <InformationIcon />
        </button>
      </div>
      <template v-if="topicData.multipleVotes">
        <div class="flex flex-row items-center gap-2">
          <DgaCheckbox v-model="topicData.distinctVotes"></DgaCheckbox>
          <label class="flex-none">{{ $t("app.topic.distinctVotes") }}</label>
          <button
            type="button"
            @click="showInputHintModal = 'distinctVotes'"
            :title="$t('app.detail')"
          >
            <InformationIcon />
          </button>
        </div>
        <div class="grid grid-cols-12 items-center gap-2">
          <div class="col-span-12 md:col-span-2">
            {{ $t("app.topic.defaultVotes") }}
          </div>
          <DgaInput
            v-model.number="topicData.defaultVotes"
            type="number"
            min="1"
            :max="
              topicData.distinctVotes
                ? topicData.choices.choices.length
                : undefined
            "
            class="col-span-12 md:col-span-10"
          ></DgaInput>
        </div>
      </template>
    </div>
    <h3 class="col-span-12 mt-2 font-bold">
      {{ $t("app.topic.voteDuration.title") }}
    </h3>
    <div class="col-span-12 md:col-span-2">
      {{ $t("app.topic.voteDuration.inputMode") }}
    </div>
    <div class="col-span-12 md:col-span-10">
      <DgaVueSelect
        v-model="topicData.durationMode"
        :options="durationModeOptions"
        :reduce="(val) => val.value"
      >
        <template #year="{ year }">
          {{ formatYearByLocale(year) }}
        </template>
        <template #year-overlay-value="{ text, value }">
          {{ formatYearByLocale(value) }}
        </template>
      </DgaVueSelect>
    </div>
    <div class="col-span-12 md:col-span-2">
      {{ $t("app.topic.voteDuration.start") }}
    </div>
    <div class="col-span-12 flex flex-col gap-2 md:col-span-10 md:flex-row">
      <VueDatePicker
        v-model="voteStart"
        is-24
        teleport
        teleport-center
        :locale="i18n.locale.value"
        :clearable="false"
        :placeholder="$t('app.topic.voteDuration.startDate')"
        class="w-full"
        :format="formatDateByLocale"
      >
        <template #year="{ year }">
          {{ formatYearByLocale(year) }}
        </template>
        <template #year-overlay-value="{ text, value }">
          {{ formatYearByLocale(value) }}
        </template>
      </VueDatePicker>
    </div>
    <template v-if="topicData.durationMode === 'startEnd'">
      <div class="col-span-12 md:col-span-2">
        {{ $t("app.topic.voteDuration.end") }}
      </div>
      <div class="col-span-12 flex flex-col gap-2 md:col-span-10 md:flex-row">
        <VueDatePicker
          v-model="voteEnd"
          teleport
          teleport-center
          :min="startExpiredDateStr"
          is-24
          :locale="i18n.locale.value"
          :clearable="false"
          :placeholder="$t('app.topic.voteDuration.endDate')"
          class="w-full"
          :format="formatDateByLocale"
        ></VueDatePicker>
      </div>
    </template>
    <template v-else>
      <div class="col-span-12 md:col-span-2">
        {{ $t("app.topic.voteDuration.duration") }}
      </div>
      <div class="col-span-12 flex flex-col gap-2 sm:flex-row md:col-span-10">
        <div class="flex w-full flex-row items-center gap-2">
          <DgaInput
            type="number"
            v-model.number="voteDuration.durationDays"
            :placeholder="$t('app.timePeriod.day', { count: 2 })"
            min="0"
            class="w-20 flex-1"
          ></DgaInput>
          <div class="w-16 sm:w-auto">
            {{ $t("app.timePeriod.day", { count: 2 }) }}
          </div>
        </div>
        <div class="flex w-full flex-row items-center gap-2">
          <DgaInput
            type="number"
            v-model.number="voteDuration.durationHours"
            :placeholder="$t('app.timePeriod.hour', { count: 2 })"
            min="0"
            max="23"
            class="w-20 flex-1"
          ></DgaInput>
          <div class="w-16 sm:w-auto">
            {{ $t("app.timePeriod.hour", { count: 2 }) }}
          </div>
        </div>
        <div class="flex w-full flex-row items-center gap-2">
          <DgaInput
            type="number"
            v-model.number="voteDuration.durationMinutes"
            :placeholder="$t('app.timePeriod.minute', { count: 2 })"
            min="0"
            max="59"
            class="w-20 flex-1"
          ></DgaInput>
          <div class="w-16 sm:w-auto">
            {{ $t("app.timePeriod.minute", { count: 2 }) }}
          </div>
        </div>
      </div>
    </template>
    <h3 class="col-span-12 mt-2 font-bold">
      {{ $t("app.topic.topicQuestion") }}
    </h3>
    <div class="col-span-12">
      <DgaInput
        v-model="topicData.name"
        type="text"
        class="dga-evote-input w-full"
        :placeholder="$t('app.topic.topicQuestion')"
        required
      >
      </DgaInput>
    </div>
    <h3 class="col-span-12 mt-2 font-bold">
      {{ $t("app.topic.addChoice.title") }}
    </h3>
    <div
      v-for="(choice, i) of topicData.choices.choices"
      class="col-span-12 flex items-center justify-center"
    >
      <div
        class="flex w-full max-w-xl flex-col items-center justify-center gap-2 sm:flex-row"
      >
        <div class="flex flex-row gap-2">
          <span
            class="border-[3px] border-red-500"
            :class="[isChoiceValid(choice.name) ? 'invisible' : '']"
            :title="getChoiceErrorReason(choice.name)"
          >
            <ExclamationIcon class="text-red-500" />
          </span>
          <DgaInput
            v-model="choice.name"
            type="text"
            class="w-full flex-1"
          ></DgaInput>
          <button
            class="inline-flex items-center rounded-full border-[3px] border-dga-blue px-1 py-1"
            :title="`${$t('app.topic.addChoice.remove')} [${choice.name}]`"
            @click="removeOption(i)"
          >
            <MinusIcon />
          </button>
        </div>
        <DgaImagePicker
          v-model="topicData.images[i]"
          :exists-image="getExistsImage(i)"
        />
      </div>
    </div>
    <div class="col-span-12 flex items-center justify-center">
      <DgaButton
        color="dga-orange"
        class="flex flex-row items-center gap-2"
        :title="$t('app.topic.addChoice.add')"
        @click="addOption"
      >
        {{ $t("app.topic.addChoice.add") }} <PlusIcon />
      </DgaButton>
    </div>
    <h3 class="col-span-12 mt-2 font-bold">{{ $t("app.voterList.title") }}</h3>
    <DgaUserTable
      class="col-span-12"
      :users="voterAllows"
      :multiple-votes="topicData.multipleVotes"
      :is-user-valid="isVoterValid"
      :get-error-reason="getVoterErrorReason"
      @add="addVoter"
      @remove="removeVoter"
      @users="addVoters"
    >
      <template #multipleVotes="{ user }">
        <DgaInput
          v-model.number="(user as VoterAllowFormData).totalVotes"
          type="number"
          min="1"
          :max="
            topicData.distinctVotes
              ? topicData.choices.choices.length
              : undefined
          "
          class="w-full min-w-[100px]"
          :placeholder="$t('app.voterList.totalVotes')"
        >
        </DgaInput>
      </template>
    </DgaUserTable>
    <template v-if="!noCoadmin">
      <h3 class="col-span-12 mt-2 font-bold">
        {{ $t("app.topic.coadminList.title") }}
      </h3>
      <DgaUserTable
        class="col-span-12"
        :users="coadmins"
        coadmin
        :is-user-valid="isCoadminValid"
        :get-error-reason="getCoadminErrorReason"
        @add="addCoadmin"
        @remove="removeCoadmin"
        @users="addCoadmins"
      >
      </DgaUserTable>
    </template>
    <div class="col-span-12 flex flex-row items-center gap-2">
      <DgaCheckbox v-model="topicData.notifyVoter"></DgaCheckbox>
      <label class="flex-none"> {{ $t("app.topic.notifyUsers") }}</label>
    </div>
    <div class="col-span-12 flex flex-row items-center gap-2">
      <DgaCheckbox v-model="topicData.showCreator"></DgaCheckbox>
      <label class="flex-none"> {{ $t("app.topic.showCreator") }}</label>
      <button
        type="button"
        @click="showInputHintModal = 'showCreator'"
        :title="$t('app.detail')"
      >
        <InformationIcon />
      </button>
    </div>
    <div class="col-span-12 flex flex-row items-center gap-2">
      <DgaCheckbox v-model="topicData.recoredToBlockchain"></DgaCheckbox>
      <label class="flex-none"> {{ $t("app.topic.recordBlockchain") }}</label>
    </div>
    <DgaModal
      :show="showInputHintModal !== false"
      cancel-backdrop
      close-only
      @close="showInputHintModal = false"
    >
      <template v-if="showInputHintModal === 'multipleVotes'">
        <p>การลงคะแนนใน 1 กระทู้ได้มากกว่า 1 ตัวเลือก</p>
      </template>
      <template v-else-if="showInputHintModal === 'distinctVotes'">
        <p>
          <b>{{ $t("app.topic.distinctVotes") }}</b> คือ
          การตั้งค่าให้ตัวเลือกในกระทู้โหวตนั้นๆ สามารถเลือกได้สูงสุดเพียง 1
          สิทธิ์ ตัวอย่างเช่น มีตัวเลือก A.) , B.) , C.) , D.)
          ผู้โหวตมีสิทธิ์ลงคะแนนเสียง 2 สิทธิ์
          ผู้โหวตจะสามารถเลือกลงคะแนนให้ตัวเลือก A.) , B.) , C.) , D.)
          เพียงตัวเลือกละ 1 สิทธิ์สูงสุด อาจเป็น A.) , B.) อย่างละ 1 สิทธิ์ หรือ
          C.) , D.) อย่างละ 1 สิทธิ์ โดยไม่สามารถเลือกเป็นตัวเลือก D.) ทั้ง 2
          คะแนนสิทธิ์ได้
        </p>
      </template>
      <template v-else-if="showInputHintModal === 'showCreator'">
        <p>
          <b>{{ $t("app.topic.showCreator") }}</b>
          เนื่องจากกฎหมายคุ้มครองข้อมูลส่วนบุคคคล หากผู้สร้างโหวต เลือก
          “แสดงรายชื่อผู้สร้างโหวตสู่สาธารณะ”
          ชื่อของท่านจะถูกแสดงสู่สาธารณะทั้งในระบบและตัวรายงาน
        </p>
      </template>
      <template v-else-if="showInputHintModal === 'anonymousVotes'">
        <p>
          การลงคะแนนดิจิทัลที่ผู้ลงคะแนนทั้งภาครัฐและประชาชนทุกคนสามารถลงคะแนนทั้งนี้กระทู้โหวตและผลลัพธ์หลังจากปิดโหวตจะถูกแสดงต่อสาธารณะ
        </p>
      </template>
    </DgaModal>
  </div>
</template>

<script setup lang="ts">
import PlusIcon from "vue-material-design-icons/Plus.vue";
import ExclamationIcon from "vue-material-design-icons/Exclamation.vue";
import MinusIcon from "vue-material-design-icons/Minus.vue";
import InformationIcon from "vue-material-design-icons/Information.vue";

import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import {
  getDefaultChoices,
  getDefaultInternalTopicFilter,
  topicTypes,
} from "~/src/services/form/topic";
import {
  choiceCountOf,
  isCoadminValid as _isCoadminValid,
} from "~/src/services/validations/topic";
import { voterCountOf } from "~/src/services/validations/user";

dayjs.extend(buddhistEra);

const props = withDefaults(
  defineProps<{
    modelValue?: TopicFormData;
    noCoadmin?: boolean;
    voterAllows?: VoterAllowFormData[];
    coadmins?: CoadminFormData[];
  }>(),
  {}
);

const emit = defineEmits<{
  (e: "update:modelValue", v: TopicFormData): void;
  (e: "template", v: void): void;
}>();

const i18n = useI18n();

const startDate = dayjs()
  .minute(0)
  .second(0)
  .millisecond(0)
  .add(1, "hour")
  .toDate();
const expiredDate = dayjs(startDate)
  .add(1, "hour")
  .minute(0)
  .second(0)
  .millisecond(0)
  .toDate();
const voteStart = ref(dayjs(startDate).format("YYYY-MM-DD HH:mm"));
const voteEnd = ref(dayjs(expiredDate).format("YYYY-MM-DD HH:mm"));
const voteDuration = ref({
  durationDays: dayjs(expiredDate).diff(startDate, "days"),
  durationHours: dayjs(expiredDate).diff(startDate, "hours") % 24,
  durationMinutes: dayjs(expiredDate).diff(startDate, "minutes") % 60,
});
const startExpiredDateStr = computed(() =>
  dayjs(voteStart.value, "YYYY-MM-DD").format("YYYY-MM-DD")
);

const voterAllows: Ref<VoterAllowFormData[]> = ref([]);
const coadmins: Ref<CoadminFormData[]> = ref([]);

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  type: "private",
  internalFilter: getDefaultInternalTopicFilter(),
  choices: getDefaultChoices(),
  durationMode: "startDuration",
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  coadmins: [],
  multipleVotes: false,
  distinctVotes: false,
  anonymousVotes: false,
  notifyVoter: true,
  defaultVotes: 1,
  voterAllows: [],
  showCreator: false,
  recoredToBlockchain: true,
  images: [],
});

const modelValue = computed(() => props.modelValue);
const voterAllowsRef = computed(() => props.voterAllows);
const coadminsRef = computed(() => props.coadmins);
const showInputHintModal: Ref<string | false> = ref(false);

watch(
  modelValue,
  (value) => {
    if (value) {
      topicData.value = value;

      const startDate = dayjs(value.voteStartAt);
      const expiredDate = dayjs(value.voteExpiredAt);

      voteStart.value = startDate.format("YYYY-MM-DD HH:mm");
      voteEnd.value = expiredDate.format("YYYY-MM-DD HH:mm");
      (voteDuration.value.durationDays = expiredDate.diff(startDate, "days")),
        (voteDuration.value.durationHours =
          expiredDate.diff(startDate, "hours") % 24);
      voteDuration.value.durationMinutes =
        expiredDate.diff(startDate, "minutes") % 60;
    }
  },
  { deep: true, immediate: true }
);

watch(
  voterAllowsRef,
  (value) => {
    if (value) {
      voterAllows.value = value;
    }
  },
  { deep: true, immediate: true }
);

watch(
  coadminsRef,
  (value) => {
    if (value) {
      coadmins.value = value;
    }
  },
  { deep: true, immediate: true }
);

const votePublicOptions = computed(() => {
  return topicTypes.map((val) => {
    return { label: i18n.t(`app.topicType.${val}`, val), value: val };
  });
});

const durationModeOptions = computed(() =>
  ["startDuration", "startEnd"].map((mode) => {
    return {
      label: i18n.t(`app.topic.voteDuration.mode.${mode}`),
      value: mode,
    };
  })
);

watch(
  voterAllows,
  (value) => {
    topicData.value.voterAllows = value.map((ele) => {
      return {
        userid: ele.userid,
        totalVotes: topicData.value.multipleVotes ? ele.totalVotes : 1,
      };
    });
  },
  { immediate: true, deep: true }
);

watch(
  coadmins,
  (value) => {
    const result: string[] = [];
    for (const ele of value) {
      if (ele.userid) {
        result.push(ele.userid);
      }
    }
    topicData.value.coadmins = result;
  },
  { immediate: true, deep: true }
);

watch(
  voteStart,
  (value) => {
    topicData.value.voteStartAt = dayjs(value, "YYYY-MM-DD HH:mm").toDate();

    if (topicData.value.durationMode === "startDuration") {
      topicData.value.voteExpiredAt = dayjs(topicData.value.voteStartAt)
        .add(voteDuration.value.durationDays, "days")
        .add(voteDuration.value.durationHours, "hours")
        .add(voteDuration.value.durationMinutes, "minutes")
        .toDate();
    } else {
      topicData.value.voteExpiredAt = dayjs(
        voteEnd.value,
        "YYYY-MM-DD HH:mm"
      ).toDate();
    }
  },
  { deep: true }
);

watch(
  voteEnd,
  (value) => {
    topicData.value.voteStartAt = dayjs(
      voteStart.value,
      "YYYY-MM-DD HH:mm"
    ).toDate();

    if (topicData.value.durationMode === "startDuration") {
      topicData.value.voteExpiredAt = dayjs(topicData.value.voteStartAt)
        .add(voteDuration.value.durationDays, "days")
        .add(voteDuration.value.durationHours, "hours")
        .add(voteDuration.value.durationMinutes, "minutes")
        .toDate();
    } else {
      topicData.value.voteExpiredAt = dayjs(value, "YYYY-MM-DD HH:mm").toDate();
    }
  },
  { deep: true }
);

watch(
  voteDuration,
  (value) => {
    topicData.value.voteStartAt = dayjs(
      voteStart.value,
      "YYYY-MM-DD HH:mm"
    ).toDate();

    if (topicData.value.durationMode === "startDuration") {
      topicData.value.voteExpiredAt = dayjs(topicData.value.voteStartAt)
        .add(value.durationDays, "days")
        .add(value.durationHours, "hours")
        .add(value.durationMinutes, "minutes")
        .toDate();
    } else {
      topicData.value.voteExpiredAt = dayjs(
        voteEnd.value,
        "YYYY-MM-DD HH:mm"
      ).toDate();
    }
  },
  { deep: true }
);

watch(
  topicData,
  (value) => {
    emit("update:modelValue", value);
  },
  { deep: true }
);

const formatDateByLocale = computed(() => {
  const locale = i18n.locale.value;

  if (locale === "th") {
    return (date: Date) => dayjs(date).format("DD/MM/BBBB HH:mm");
  }
  return (date: Date) => dayjs(date).format("DD/MM/YYYY HH:mm");
});

const formatYearByLocale = computed(() => {
  const locale = i18n.locale.value;

  if (locale === "th") {
    return (year: number) => dayjs().year(year).format("BBBB");
  }
  return (year: number) => dayjs().year(year).format("YYYY");
});

function isChoiceValid(choice: string) {
  return choice !== "" && choiceCountOf(topicData.value.choices, choice) === 1;
}

function getChoiceErrorReason(choice: string) {
  if (choice === "") {
    return i18n.t("app.topic.addChoice.error.empty");
  }

  return i18n.t("app.topic.addChoice.error.duplicated");
}

function removeOption(nth: number) {
  topicData.value.choices.choices.splice(nth, 1);
  topicData.value.images.splice(nth, 1);
}

function addOption() {
  topicData.value.choices.choices.push({ name: "" });
}

function isVoterValid(voter: UserSearchTableData) {
  const _voters = voter as VoterAllowFormData;
  return (
    voterCountOf(voterAllows.value, _voters) < 2 &&
    (topicData.value.multipleVotes ? _voters.totalVotes > 0 : true)
  );
}

function getVoterErrorReason(voter: UserSearchTableData) {
  return i18n.t("app.voterList.error.duplicated");
}

function removeVoter(user: UserSearchTableData) {
  const compareData = JSON.stringify(user);
  voterAllows.value = voterAllows.value.filter((ele) => {
    return compareData !== JSON.stringify(ele);
  });
}

function addVoter(user: UserSearchResponseData | null) {
  if (user) {
    if (voterAllows.value.every((ele) => ele.userid !== user._id)) {
      voterAllows.value.push({
        userid: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        totalVotes: user.vote || topicData.value.defaultVotes,
      });
    } else {
      useShowToast({
        title: i18n.t("app.voterList.searchUser"),
        content: i18n.t("app.voterList.error.duplicated"),
        autoCloseDelay: 5000,
      });
    }
  } else {
    useShowToast({
      title: i18n.t("app.voterList.searchUser"),
      content: i18n.t("app.voterList.error.notFound"),
      autoCloseDelay: 5000,
    });
  }
}

function addVoters(users: UserSearchResponseData[] | null) {
  if (users && users.length > 0) {
    let inserted = 0;
    for (const user of users) {
      if (voterAllows.value.every((ele) => ele.userid !== user._id)) {
        voterAllows.value.push({
          userid: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          totalVotes: user.vote || topicData.value.defaultVotes,
        });
        inserted += 1;
      }
    }
    useShowToast({
      title: i18n.t("app.voterList.searchUser"),
      content: `${i18n.t("app.topic.csvInserted")} ${inserted}/${users.length}`,
      autoCloseDelay: 5000,
    });
  } else {
    useShowToast({
      title: i18n.t("app.voterList.searchUser"),
      content: i18n.t("app.voterList.error.notFound"),
      autoCloseDelay: 5000,
    });
  }
}

function isCoadminValid(coadmin: UserSearchTableData) {
  return _isCoadminValid(coadmins.value, coadmin);
}
function getCoadminErrorReason(coadmin: UserSearchTableData) {
  return i18n.t("app.topic.voterList.error.duplicated");
}

function removeCoadmin(user: UserSearchTableData) {
  const compareData = JSON.stringify(user);
  coadmins.value = coadmins.value.filter((ele) => {
    return compareData !== JSON.stringify(ele);
  });
}

function addCoadmin(user: UserSearchResponseData | null) {
  if (user) {
    if (coadmins.value.every((ele) => ele.userid !== user._id)) {
      coadmins.value.push({
        userid: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    } else {
      useShowToast({
        title: i18n.t("app.voterList.searchUser"),
        content: i18n.t("app.voterList.error.duplicated"),
        autoCloseDelay: 5000,
      });
    }
  } else {
    useShowToast({
      title: i18n.t("app.voterList.searchUser"),
      content: i18n.t("app.voterList.error.notFound"),
      autoCloseDelay: 5000,
    });
  }
}

function addCoadmins(users: UserSearchResponseData[] | null) {
  if (users && users.length > 0) {
    let inserted = 0;
    for (const user of users) {
      if (coadmins.value.every((ele) => ele.userid !== user._id)) {
        coadmins.value.push({
          userid: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
        inserted += 1;
      }
    }
    useShowToast({
      title: i18n.t("app.voterList.searchUser"),
      content: `${i18n.t("app.topic.csvInserted")} ${inserted}/${users.length}`,
      autoCloseDelay: 5000,
    });
  } else {
    useShowToast({
      title: i18n.t("app.voterList.searchUser"),
      content: i18n.t("app.voterList.error.notFound"),
      autoCloseDelay: 5000,
    });
  }
}

function getExistsImage(i: number) {
  if (topicData.value.choices.choices[i].image) {
    return `/api/image/${topicData.value.choices.choices[i].image}`;
  }

  return undefined;
}
</script>

<style>
.dp__theme_light {
  --dp-font-family: "Mitr", system-ui, sans-serif;
  --dp-border-radius: theme("borderRadius.2xl");
  --dp-background-color: #ffffff;
  --dp-text-color: theme("colors.dga-orange");
  --dp-hover-color: #f3f3f3;
  --dp-hover-text-color: #212121;
  --dp-hover-icon-color: #959595;
  --dp-primary-color: #1976d2;
  --dp-primary-text-color: #f8f5f5;
  --dp-secondary-color: #c0c4cc;
  --dp-border-color: theme("colors.dga-orange");
  --dp-menu-border-color: #ddd;
  --dp-border-color-hover: theme("colors.dga-orange");
  --dp-disabled-color: #f6f6f6;
  --dp-scroll-bar-background: #f3f3f3;
  --dp-scroll-bar-color: #959595;
  --dp-success-color: #76d275;
  --dp-success-color-disabled: #a3d9b1;
  --dp-icon-color: #959595;
  --dp-danger-color: #ff6f60;
  --dp-highlight-color: rgba(25, 118, 210, 0.1);
  --dp-preview-font-size: 0.65rem;
}
.dp__input {
  border-width: 2px !important;
}
.dp__action_button {
  font-size: 0.8rem;
}
</style>
