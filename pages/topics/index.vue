<template>
  <div>
    <div
      class="mx-auto flex max-w-6xl flex-row flex-wrap items-center gap-x-4 gap-y-2"
    >
      <div
        v-if="roleMode !== 'guest'"
        class="flex w-full flex-row items-center gap-2 lg:w-60"
      >
        <div class="whitespace-nowrap">
          {{ $t("app.voting.filters.accessModifier") }}
        </div>
        <DgaVueSelect
          v-model="filter.topicType"
          :options="topciTypeFilterOptions"
          class="flex-1"
          :reduce="(val) => val.value"
        ></DgaVueSelect>
      </div>
      <DgaVueSelect
        v-model="filter.type"
        :options="topicFilterOptions"
        class="w-full lg:w-52"
        :reduce="(val) => val.value"
      ></DgaVueSelect>
      <template v-if="filter.type === 'date'">
        <DgaVueSelect
          v-model="filter.year"
          :options="yearOptions"
          class="w-full flex-none sm:flex-1 lg:w-32 lg:flex-none"
          :reduce="(val) => val.value"
        ></DgaVueSelect>
        <DgaVueSelect
          v-model="filter.month"
          :options="monthOptions"
          class="w-full flex-none sm:flex-1 lg:w-32 lg:flex-none"
          :reduce="(val) => val.value"
        ></DgaVueSelect>
      </template>
      <template v-else-if="filter.type === 'ticketId'">
        <DgaInput
          v-model="filter.ticketId"
          :placeholder="$t('app.voting.filters.ticketIdPlaceholder')"
          class="w-60 flex-1 lg:flex-none"
        ></DgaInput>
      </template>
      <template v-else-if="filter.type === 'topicName'">
        <DgaInput
          v-model="filter.keyword"
          :placeholder="$t('app.voting.filters.topicNamePlaceholder')"
          class="w-60 flex-1 lg:flex-none"
        ></DgaInput>
      </template>
      <DgaButton
        color="dga-orange"
        class="flex-0"
        :title="$t('app.voting.filters.search')"
        @click="resetTopics"
      >
        {{ $t("app.voting.filters.search") }}
      </DgaButton>
      <div
        v-if="isAdminMode"
        class="ml-auto flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row"
      >
        <DgaButton
          class="mx-auto flex w-full max-w-[200px] flex-row items-center gap-2 !px-6 !py-2 sm:w-auto"
          :title="$t('app.voting.createTopic')"
          :href="localePathOf('/topic/create')"
        >
          <PlusCircleOutlineIcon />
          {{ $t("app.voting.createTopic") }}
        </DgaButton>
      </div>
    </div>
    <div class="mx-auto my-4 flex max-w-6xl flex-col gap-4">
      <DgaTopicCard
        v-for="topic of loadedTopics"
        :topic="topic"
        :mode="roleMode"
        :editable="
          isAdminMode &&
          !isTopicExpired(
            topic,
            topic.pauseData,
            useComputedServerTime().getTime()
          )
        "
        :status="getStatusOf(topic)"
        :with-qrcode="isAdminMode"
        :is-admin="isAdminMode"
        @edit="toEditTopic(topic)"
        @qr="showQr(topic)"
        @recreate="toRecreateTopic(topic)"
        @action="handleStatusAction(topic, $event)"
      ></DgaTopicCard>
      <template v-if="isLoadMoreTopics">
        <div class="text-center text-xl italic">
          {{ $t("app.loading") }}
        </div>
      </template>
      <template v-else>
        <div
          v-if="loadedTopics.length === 0 && !hasMoreTopics"
          class="text-center text-xl italic"
        >
          {{ $t("app.voting.noMoreTopic") }}
        </div>
        <DgaButton
          v-if="hasMoreTopics && isLoadMoreTopics"
          color="dga-orange"
          class="mx-auto"
          :title="$t('app.voting.loadMoreTopic')"
          @click="loadMoreTopics"
        >
          {{ $t("app.voting.loadMoreTopic") }}
        </DgaButton>
      </template>
    </div>
    <DgaModal
      :show="showImageModal"
      cancel-backdrop
      close-only
      @close="showImageModal = false"
    >
      <img :src="qrCodeSrc" class="max-h-[77.5vh] object-contain" />
      <div>{{ currentLink }}</div>
    </DgaModal>
  </div>
</template>

<script setup lang="ts">
import PlusCircleOutlineIcon from "vue-material-design-icons/PlusCircleOutline.vue";

import QRCode from "qrcode";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/th";

import {
  isTopicReadyToVote,
  isTopicExpired,
} from "~/src/services/validations/topic";
import { GRAY_BASE64_IMAGE } from "~/src/services/formatter/image";
import { topicTypes } from "~/src/services/form/topic";

const localePathOf = useLocalePath();
const i18n = useI18n();

const roleMode = computed(() => useSessionData().value.roleMode);

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t("app.voting.title")}`,
});

const filter = ref({
  type: "all",
  month: dayjs(useComputedServerTime()).month(),
  year: dayjs(useComputedServerTime()).year(),
  topicType: <"all" | TopicType>"all",
  ticketId: "",
  keyword: "",
});

const topicFilterOptions = computed(() =>
  ["all", "date", "ticketId", "topicName"].map((value) => {
    return {
      label: i18n.t(`app.voting.filters.${value}`),
      value: value,
    };
  })
);

const topciTypeFilterOptions = computed(() =>
  ["all", ...topicTypes].map((value) => {
    return {
      label:
        value !== "all"
          ? i18n.t(`app.topicType.${value}`, value)
          : i18n.t(`app.voting.filters.${value}`),
      value: value,
    };
  })
);

const startDate = dayjs("2023-04-03T07:00:00.000");

const monthOptions = computed(() =>
  new Array(12).fill(undefined).map((ele, i) => {
    return {
      label: dayjs().locale(i18n.locale.value).month(i).format("MMM"),
      value: i,
    };
  })
);

const yearOptions = computed(() =>
  new Array(dayjs(useComputedServerTime()).year() - startDate.year() + 1)
    .fill(undefined)
    .map((ele, i) => {
      const year = dayjs(useComputedServerTime()).year() - i;
      return {
        label: dayjs(useComputedServerTime()).year(year).format("YYYY"),
        value: year,
      };
    })
);

const loadedTopics: Ref<TopicResponseDataExtended[]> = ref([]);

const pagesize = ref(50);
const startid = computed(() => {
  return loadedTopics.value.length > 0
    ? loadedTopics.value[loadedTopics.value.length - 1]._id
    : undefined;
});
const hasMoreTopics = ref(false);
const isLoadMoreTopics = ref(false);
const showImageModal = ref(false);
const currentLink = ref("");
const qrCodeSrc = ref(GRAY_BASE64_IMAGE);

function resetTopics() {
  loadedTopics.value = [];
  hasMoreTopics.value = true;
  loadMoreTopics();
}

const isAdminMode = computed(() => roleMode.value === "admin");
function isTopicEditable(topic: TopicResponseDataExtended) {
  return (
    isAdminMode.value &&
    !isTopicExpired(topic, topic.pauseData, useComputedServerTime().getTime())
  );
}

function toEditTopic(topic: TopicResponseDataExtended) {
  if (!isTopicEditable(topic)) {
    useShowToast({
      title: i18n.t("app.topic.edit.title"),
      content: i18n.t("topic.error.notEditable"),
      autoCloseDelay: 5000,
    });
    return;
  }

  navigateTo(localePathOf(`/topic/edit/${topic._id}`));
}

function toRecreateTopic(topic: TopicResponseDataExtended) {
  navigateTo(localePathOf(`/topic/recreate/${topic._id}`));
}

function getStatusOf(topic: TopicResponseDataExtended): TopicCardStatus {
  if (
    isTopicExpired(topic, topic.pauseData, useComputedServerTime().getTime())
  ) {
    return "result";
  } else if (!isTopicReadyToVote(topic, useComputedServerTime().getTime())) {
    return "waiting";
  } else {
    if (isAdminMode.value) {
      return "control";
    }
    if (!topic.canVote) {
      return "voting";
    }

    const isAlreadyVotes = topic.voted >= topic.quota;
    return isAlreadyVotes ? "voted" : "access";
  }
}

function handleStatusAction(
  topic: TopicResponseDataExtended,
  status: TopicCardStatus
) {
  switch (status) {
    case "result":
      navigateTo(localePathOf(`/topic/result/${topic._id}`));
      break;
    case "access":
    case "control":
    case "voted":
      navigateTo(localePathOf(`/vote/${topic._id}`));
      break;
    case "voting":
      useShowToast({
        title: i18n.t("app.voting.error.title"),
        content: i18n.t("app.voting.error.notVoteable"),
        autoCloseDelay: 5000,
      });
      break;
    case "waiting":
      useShowToast({
        title: i18n.t("app.voting.error.title"),
        content: i18n.t("app.voting.error.waiting"),
        autoCloseDelay: 5000,
      });
      break;
  }
}

async function showQr(topic: TopicResponseData) {
  const host = window.location;
  currentLink.value = host.protocol + "//" + host.host + "/vote/" + topic._id;
  qrCodeSrc.value = await QRCode.toDataURL(currentLink.value);
  showImageModal.value = true;
}

async function fetchTopics(filter: TopicFilterParams) {
  const fetchResult = await Promise.all([
    useFetch("/api/topics/avaliable", {
      query: { filter, roleMode: roleMode.value },
    }),
  ]);
  const [topics] = fetchResult.map((ele) => ele.data.value);
  return topics;
}

async function loadMoreTopics() {
  isLoadMoreTopics.value = true;
  let actualFilter: TopicFilterParams = {
    type: "all",
    pagesize: pagesize.value,
    startid: startid.value,
    topicType: filter.value.topicType,
  };
  if (filter.value.type === "date") {
    actualFilter = {
      type: "date",
      year: filter.value.year,
      month: filter.value.month,
      pagesize: pagesize.value,
      startid: startid.value,
      topicType: filter.value.topicType,
    };
  } else if (filter.value.type === "ticketId") {
    actualFilter = {
      type: "ticketId",
      ticketId: filter.value.ticketId,
      pagesize: pagesize.value,
      startid: startid.value,
      topicType: filter.value.topicType,
    };
  } else if (filter.value.type === "topicName") {
    actualFilter = {
      type: "topicName",
      keyword: filter.value.keyword,
      pagesize: pagesize.value,
      startid: startid.value,
      topicType: filter.value.topicType,
    };
  }

  const topics = await fetchTopics(actualFilter);
  if (topics) {
    loadedTopics.value.push(...topics.topics);
    hasMoreTopics.value = topics.topics.length === pagesize.value;
  }
  isLoadMoreTopics.value = false;
}

await loadMoreTopics();
</script>
