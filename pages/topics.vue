<template>
  <div>
    <div class="flex flex-row flex-wrap items-center gap-x-4 gap-y-4 mx-auto max-w-6xl">
      <DgaSelect v-model="filter.type" :options="topicFilterOptions" class="w-56"></DgaSelect>
      <template v-if="filter.type === 'date'">
        <DgaSelect v-model="filter.year" :options="yearOptions" class="w-32"></DgaSelect>
        <DgaSelect v-model="filter.month" :options="monthOptions" class="w-32"></DgaSelect>
      </template>
      <template v-else-if="filter.type === 'ticketId'">
        <DgaInput v-model="filter.ticketId" :placeholder="$t('voting.filters.ticketIdPlaceholder')" class="w-56"></DgaInput>
      </template>
      <template v-else-if="filter.type === 'topicName'">
        <DgaInput v-model="filter.keyword" :placeholder="$t('voting.filters.topicNamePlaceholder')" class="w-56"></DgaInput>
      </template>
      <DgaButton color="dga-orange" class="flex-0" :title="$t('voting.filters.search')" @click="resetTopics">
        {{ $t("voting.filters.search") }}
      </DgaButton>
      <DgaButton 
        v-if="roleMode === 'admin' || roleMode === 'developer'"
        class="md:ml-auto flex flex-row gap-2 items-center !px-6 !py-2" color="dga-orange"
        :title="$t('voting.createTopic')"
        :href="localePathOf('/topic/create')"
      >
        <MaterialIcon icon="add_circle"></MaterialIcon>
        {{ $t('voting.createTopic') }}
      </DgaButton>
    </div>
    <div class="my-4 flex flex-col gap-4 mx-auto max-w-6xl">
      <DgaTopicCard v-for="topic of loadedTopics" :topic="topic" :mode="roleMode"
        :editable="isAdminMode"
        :status="getStatusOf(topic)"
        @edit="toEditTopicPage(topic)"
        @action="handleStatusAction(topic, $event)"
      ></DgaTopicCard>
      <template v-if="isLoadMoreTopics">
        <div class="text-center text-xl italic">
          {{ $t("voting.loadingTopic") }}
        </div>
      </template>
      <template v-else>
        <div v-if="loadedTopics.length === 0 && !hasMoreTopics" class="text-center text-xl italic">
          {{ $t("voting.noMoreTopic") }}
        </div>
        <DgaButton v-if="hasMoreTopics && isLoadMoreTopics" color="dga-orange" class="mx-auto" :title="$t('voting.loadMoreTopic')" @click="loadMoreTopics">
          {{ $t('voting.loadMoreTopic') }}
        </DgaButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { getComputedServerTime, getComputedServerTime as serverTime } from "~~/src/utils/datetime"
import { isTopicExpired, isTopicReadyToVote } from "~~/src/utils/topic";

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth"]
})
const roleMode = computed(() => useSessionData().value.roleMode);
useHead({
  title: `${i18n.t('appName', 'Dga E-Voting')} - ${i18n.t('voting.title')}`
});

const filter = ref({
  type: "all",
  month: dayjs(serverTime()).month(),
  year: dayjs(serverTime()).year(),
  ticketId: "",
  keyword: "",
});

const topicFilterOptions = computed(() => 
  ["all", "date", "ticketId", "topicName"].map((value) => {
    return {
      label: i18n.t(`voting.filters.${value}`),
      value: value
    }
  })
);

const startDate = dayjs("2023-04-03T07:00:00.000");

const monthOptions = ref(new Array(12).fill(undefined).map((ele, i) => {
  return {
    label: dayjs().month(i).format("MMM"),
    value: i,
  }
}))

const yearOptions = ref(new Array(dayjs(serverTime()).year() - startDate.year() + 1).fill(undefined).map((ele, i) => {
  const year = dayjs(serverTime()).year() - i;
  return {
    label: dayjs(serverTime()).year(year).format("YYYY"),
    value: year,
  }
}))

const loadedTopics : Ref<Array<TopicResponseDataExtended>> = ref([]);

const pagesize = ref(50);
const startid = computed(() => {
  return loadedTopics.value.length > 0 ? loadedTopics.value[loadedTopics.value.length - 1]._id : undefined;
})
const hasMoreTopics = ref(false);
const isLoadMoreTopics = ref(false);

function resetTopics() {
  loadedTopics.value = [];
  hasMoreTopics.value = true;
  loadMoreTopics();
}

const isAdminMode = computed(() => roleMode.value === 'admin' ||  roleMode.value === 'developer');

function toEditTopicPage(topic: TopicResponseDataExtended) {
  if(isTopicReadyToVote(topic)) {
    useShowToast({
      title: i18n.t('topic.edit.title'),
      content: i18n.t('topic.error.notEditable') ,
      autoCloseDelay: 5000,
    })
    return;
  }

  navigateTo(localePathOf(`/topic/edit/${topic._id}`));
}

function getStatusOf(topic: TopicResponseDataExtended) : TopicCardStatus {
  if(isTopicExpired(topic, getComputedServerTime().getTime())) {
    return "result";
  } else if(!isTopicReadyToVote(topic, getComputedServerTime().getTime())) {
    return "waiting";
  } else if(!useSessionData().value.userid) {
      return "voting";
  } else if( !isAdminMode) {
    if(topic.voterAllow) {
      return topic.voterAllow.remainVotes > 0 ? "access" : "voted"
    } else {
      return "voting";
    }
  }

  return "access";
}

function handleStatusAction(topic: TopicResponseDataExtended, status: TopicCardStatus) {
  switch(status) {
    case "result":
      navigateTo(localePathOf(`/topic/result/${topic._id}`));
      break;
    case "access":
    case "voted":
      navigateTo(localePathOf(`/vote/${topic._id}`));
      break;
    case "voting":
      useShowToast({
        title: i18n.t('voting.error.title'),
        content: i18n.t('voting.error.notVoteable') ,
        autoCloseDelay: 5000,
      })
      break;
    case "waiting":
      useShowToast({
        title: i18n.t('voting.error.title'),
        content: i18n.t('voting.error.waiting') ,
        autoCloseDelay: 5000,
      });
      break;
  }
}

async function fetchTopics(filter: TopicFilterParams) {
  const fetchResult = await Promise.all([
    useFetch("/api/topics", {
      query: { filter }
    })
  ])
  const [ topics ] = fetchResult.map((ele) => ele.data.value);
  return topics;
}


async function loadMoreTopics() {
  isLoadMoreTopics.value = true;
  let actualFilter : TopicFilterParams = {
    type: "all",
    pagesize: pagesize.value,
    startid: startid.value,
  };
  if(filter.value.type === "date") {
    actualFilter = {
      type: "date",
      year: filter.value.year,
      month: filter.value.month,
      pagesize: pagesize.value,
      startid: startid.value,
    };
  } else if(filter.value.type === "ticketId") {
    actualFilter = {
      type: "ticketId",
      ticketId: filter.value.ticketId,
      pagesize: pagesize.value,
      startid: startid.value,
    };
  } else if(filter.value.type === "topicName") {
    actualFilter = {
      type: "topicName",
      keyword: filter.value.keyword,
      pagesize: pagesize.value,
      startid: startid.value,
    };
  }
  
  const topics = await fetchTopics(actualFilter);
  if(topics) {
    loadedTopics.value.push(...topics.topics);
    hasMoreTopics.value = topics.topics.length === pagesize.value;
  }
  isLoadMoreTopics.value = false;
}

await loadMoreTopics();


</script>