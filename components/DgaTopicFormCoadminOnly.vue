<template>
  <div
    class="mx-auto my-4 grid max-w-4xl grid-cols-12 items-center gap-x-4 gap-y-2"
  >
    <h3 class="col-span-12 mt-2 font-bold">
      {{ $t("app.topic.topicQuestion") }}
    </h3>
    <div class="col-span-12">
      <DgaInput
        :value="topicData.name"
        type="text"
        readonly
        class="dga-evote-input w-full"
        :placeholder="$t('app.topic.topicQuestion')"
        required
      >
      </DgaInput>
    </div>
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
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import {
  getDefaultChoices,
  getDefaultInternalTopicFilter,
} from "~/src/services/form/topic";
import { isCoadminValid as _isCoadminValid } from "~/src/services/validations/topic";

const props = withDefaults(
  defineProps<{
    modelValue?: TopicFormData;
    coadmins?: CoadminFormData[];
  }>(),
  {}
);

const emit = defineEmits<{
  (e: "update:modelValue", v: TopicFormData): void;
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
const coadminsRef = computed(() => props.coadmins);

watch(
  modelValue,
  (value) => {
    if (value) {
      topicData.value = value;
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
  topicData,
  (value) => {
    emit("update:modelValue", value);
  },
  { deep: true }
);

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
</script>

<style scoped>
.user-grid {
  @apply grid w-full items-center gap-x-4 gap-y-2 whitespace-nowrap pb-2;
  grid-template-columns: 36px 2fr 4fr 3fr 36px;
}
.user-grid.multichoice {
  grid-template-columns: 36px 2fr 4fr 3fr 2fr 36px;
}
</style>
