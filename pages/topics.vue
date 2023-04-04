<template>
  <div>
    <div class="flex flex-row flex-wrap items-center gap-x-4 gap-y-4">
      <DgaSelect v-model="filter.type" :options="topicFilterOptions" class="flex-[2] min-w-[150px]"></DgaSelect>
      <template v-if="filter.type === 'date'">
        <DgaSelect v-model="filter.year" :options="yearOptions" class="flex-1 min-w-[100px]"></DgaSelect>
        <DgaSelect v-model="filter.month" :options="monthOptions" class="flex-1 min-w-[100px]"></DgaSelect>
      </template>
      <template v-else-if="filter.type === 'ticketId'">
        <DgaInput v-model="filter.ticketId" placeholder="#Ticket Vote" class="flex-1 min-w-[150px]"></DgaInput>
      </template>
      <template v-else-if="filter.type === 'topicName'">
        <DgaInput v-model="filter.keyword" placeholder="Topic Question" class="flex-1 min-w-[150px]"></DgaInput>
      </template>
      <DgaButton color="dga-orange" class="flex-0" @click="resetTopics">Go</DgaButton>
    </div>
    <div class="my-4 flex flex-col gap-4">
      <DgaTopicCard v-for="topic of loadedTopics" :topic="topic" :mode="roleMode" @access="accessTo(topic, $event)"></DgaTopicCard>
      <template v-if="isLoadMoreTopics">
        <div class="text-center text-xl italic">
          Loading...
        </div>
      </template>
      <template v-else>
        <div v-if="loadedTopics.length === 0 && !hasMoreTopics" class="text-center text-xl italic">
          No more topics
        </div>
        <DgaButton v-if="hasMoreTopics && isLoadMoreTopics" color="dga-orange" class="mx-auto" @click="loadMoreTopics">Load more topics</DgaButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { webAppName } from "~~/src/utils/utils"
import { getComputedServerTime as serverTime } from "~~/src/utils/datetime"

definePageMeta({
  middleware: ["auth-voter"]
});

useHead({
  title: `${webAppName} - ร่วมโหวต`
});

const filter = ref({
  type: "all",
  month: dayjs(serverTime()).month(),
  year: dayjs(serverTime()).year(),
  ticketId: "",
  keyword: "",
});

const topicFilterOptions = ref([{
  label: "ทั้งหมด",
  value: "all",
},
{
  label: "จากวันที่",
  value: "date",
},
{
  label: "จาก Ticket Vote",
  value: "ticketId", 
},
{
  label: "จาก Topic Question",
  value: "topicName", 
}]);

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

const loadedTopics : Ref<Array<TopicResponseData>> = ref([]);

const pagesize = ref(50);
const startid = computed(() => {
  return loadedTopics.value.length > 0 ? loadedTopics.value[loadedTopics.value.length - 1]._id : undefined;
})
const hasMoreTopics = ref(false);
const isLoadMoreTopics = ref(false);

const roleMode = computed(() => useSessionData().value.roleMode);

function resetTopics() {
  loadedTopics.value = [];
  hasMoreTopics.value = true;
  loadMoreTopics();
}

function accessTo(topic: TopicResponseData, type: string) {
  const id = topic._id;
  switch(type) {
    case "edit":
      navigateTo(`/topic/edit/${id}`);
      break;
    case "access":
    case "completed":
      navigateTo(`/vote/${id}`);
      break;
    case "result":
      navigateTo(`/topic/result/${id}`);
      break;
      break;
    case "waiting":
      // navigateTo(`/topic/${id}`);
      break;
  }
}

async function fetchTopics(type: TopicQueryType, filter: TopicFilterParams) {
  const fetchResult = await Promise.all([
    useFetch("/api/topics", {
      query: { type, filter }
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
  
  const topics = await fetchTopics("active", actualFilter);
  if(topics) {
    loadedTopics.value.push(...topics.topics);
    hasMoreTopics.value = topics.topics.length === pagesize.value;
  }
  isLoadMoreTopics.value = false;
}

await loadMoreTopics();


</script>