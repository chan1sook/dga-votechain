<template>
  <div class="p-4 w-full mx-auto">
    <div class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-4">
        Voter
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-7xl mx-auto my-4">
        <BasicCard>
          <template #header>รายการที่โหวตไปแล้ว</template>
          <div v-if="loadedTopics.voted.length > 0" class="p-2 overflow-auto max-h-60">
            <NuxtLink v-for="(topic, i) of loadedTopics.voted" :to="`/vote/${topic._id}`">
              <BasicListItem>
                <template #header>{{ i + 1 }}.</template>
                {{ topic.name }}
              </BasicListItem>
            </NuxtLink>
            <template v-if="hasMoreTopics.voted">
              <div v-if="!isLoadMoreTopics.voted" class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
                <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Load More Topic" @click="loadMoreTopics('voted')">
                  <MaterialIcon icon="autorenew" />
                  <span class="truncate">Load More</span>
                </button>
              </div>
              <div v-else class="p-2 text-center italic">Loading...</div>
            </template>
          </div>
          <div v-else class="p-2 text-center italic">Topics not found</div>
        </BasicCard>
        <BasicCard>
          <template #header>รายการโหวต</template>
          <div v-if="loadedTopics.notvoted.length > 0" class="p-2 overflow-auto max-h-60">
            <NuxtLink v-for="(topic, i) of loadedTopics.notvoted" :to="`/vote/${topic._id}`">
              <BasicListItem>
                <template #header>{{ i + 1 }}.</template>
                {{ topic.name }}
              </BasicListItem>
            </NuxtLink>
            <template v-if="hasMoreTopics.notvoted">
              <div v-if="!isLoadMoreTopics.notvoted" class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
                <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Load More Topic" @click="loadMoreTopics('notvoted')">
                  <MaterialIcon icon="autorenew" />
                  <span class="truncate">Load More</span>
                </button>
              </div>
              <div v-else class="p-2 text-center italic">Loading...</div>
            </template>
          </div>
          <div v-else class="p-2 text-center italic">Topics not found</div>
        </BasicCard>
        <BasicCard>
          <template #header>กระดานข่าว</template>
          <div v-if="news.length > 0" class="p-2 overflow-auto max-h-60">
            <NuxtLink v-for="data of news" :to="`/news/info/${data._id}`">
              <BasicListItem header-class="w-44">
                <template #header>{{ formatDateTime(data.newsPublishAt) }}.</template>
                {{ data.title }}
              </BasicListItem>
            </NuxtLink>
            <template v-if="hasMoreNews">
              <div v-if="!isLoadMoreNews" class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
                <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Load More News" @click="loadMoreNews">
                  <MaterialIcon icon="autorenew" />
                  <span class="truncate">Load More</span>
                </button>
              </div>
              <div v-else class="p-2 text-center italic">Loading...</div>
            </template>
          </div>
          <div v-else class="p-2 text-center italic">News not found</div>
        </BasicCard>
        <BasicCard>
          <template #header>ผลโหวต</template>
          <div v-if="loadedTopics.finished.length > 0" class="p-2 overflow-auto max-h-60">
            <NuxtLink v-for="(topic, i) of loadedTopics.finished" :to="`/topic/result/${topic._id}`">
              <BasicListItem>
                <template #header>{{ i + 1 }}.</template>
                {{ topic.name }}
              </BasicListItem>
            </NuxtLink>
            <template v-if="hasMoreTopics.finished">
              <div v-if="!isLoadMoreTopics.finished" class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
                <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Load More Topic" @click="loadMoreTopics('finished')">
                  <MaterialIcon icon="autorenew" />
                  <span class="truncate">Load More</span>
                </button>
              </div>
              <div v-else class="p-2 text-center italic">Loading...</div>
            </template>
          </div>
          <div v-else class="p-2 text-center italic">Topics not found</div>
        </BasicCard>
      </div>
      <div class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
        <NuxtLink :to="editProfileUrl" class="w-full sm:w-72 block">
          <button type="button" class="dga-evote-btn w-full inline-flex gap-2 items-center justify-center"
            title="แก้ไขข้อมูลส่วนบุคคล" @click="redirectEditProfileDID">
            <MaterialIcon icon="fingerprint" />
            <span class="truncate">แก้ไขข้อมูลส่วนบุคคล</span>
          </button>
        </NuxtLink>
        <NuxtLink to="/topic/request" class="w-full sm:w-48 block">
          <button type="button" class="dga-evote-btn w-full inline-flex gap-2 items-center justify-center" title="ขอตั้งโหวต">
            <MaterialIcon icon="ballot" />
            <span class="truncate">ขอตั้งโหวต</span>
          </button>
        </NuxtLink>
        <button type="button" v-if="isAdminRole" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="สลับโหมด" @click="swapNextMode">
          <MaterialIcon icon="autorenew" />
          <span class="truncate">สลับโหมด</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime, webAppName } from "~~/src/utils/utils"
import { checkPermissionNeeds } from "~~/src/utils/permissions";

definePageMeta({
  middleware: ["auth-voter"]
});

useHead({
  title: `${webAppName} - Main Page`
});

const isAdminRole = computed(() => {
  return checkPermissionNeeds(usePermissions().value, "access-pages:admin");
})

const { DID_API_URL } = useRuntimeConfig();
const editProfileUrl = computed(() => new URL("/Account/Profile", DID_API_URL).toString());

const loadedTopics : Ref<{
  notvoted: Array<TopicResponseData>,
  voted: Array<TopicResponseData>,
  finished: Array<TopicResponseData>,
}> = ref({
  notvoted: [],
  voted: [], 
  finished: [], 
});
const news: Ref<Array<NewsResponseData>> = ref([]);

const pagesize = ref(50);
const startids = computed(() => {
  const notvotedStartid = loadedTopics.value.notvoted.length > 0 ? 
    loadedTopics.value.notvoted[loadedTopics.value.notvoted.length - 1]._id : undefined;
  const votedStartid = loadedTopics.value.voted.length > 0 ? 
    loadedTopics.value.voted[loadedTopics.value.voted.length - 1]._id : undefined;
  const finishedStartid = loadedTopics.value.finished.length > 0 ? 
    loadedTopics.value.finished[loadedTopics.value.finished.length - 1]._id : undefined;
  const newsStartid = news.value.length > 0 ? news.value[news.value.length - 1]._id : undefined;
  return {
    notvoted: notvotedStartid,
    voted: votedStartid,
    finished: finishedStartid,
    news: newsStartid,
  }
})
const hasMoreTopics = ref({
  notvoted: false,
  voted: false,
  finished: false,
});
const hasMoreNews = ref(false);
const isLoadMoreTopics = ref({
  notvoted: false,
  voted: false,
  finished: false,
});
const isLoadMoreNews = ref(false);

function redirectEditProfileDID(event: MouseEvent) {
  alert("Warn: Not Fully Implemeted");
}

function swapNextMode(event: MouseEvent) {
  if(isAdminRole.value) {
    navigateTo("/admin")
  }
}

async function fetchTopics(type: TopicQueryType, pagesize?: number, startid?: string) {
  const fetchResult = await Promise.all([
    useFetch("/api/topics", {
      query: { type, pagesize, startid }
    })
  ])
  const [ topics ] = fetchResult.map((ele) => ele.data.value);
  return topics;
}

async function loadMoreTopics(type: "voted" | "notvoted" | "finished") {
  isLoadMoreTopics.value[type] = true;
  const topics = await fetchTopics(type, pagesize.value, startids.value[type]);
  if(topics) {
    loadedTopics.value[type].push(...topics.topics);
    hasMoreTopics.value[type] = topics.topics.length === pagesize.value;
  }
  isLoadMoreTopics.value[type] = false;
}

async function fetchNews(pagesize?: number, startid?: string) {
  const fetchResult = await Promise.all([
    useFetch("/api/news", {
      query: { type: "available", pagesize, startid }
    })
  ])
  const [ news ] = fetchResult.map((ele) => ele.data.value);
  return news;
}

async function loadMoreNews() {
  isLoadMoreNews.value = true;
  const _news = await fetchNews(pagesize.value, startids.value.news);
  if(_news) {
    news.value.push(..._news.news);
    hasMoreNews.value = _news.news.length === pagesize.value;
  }
  isLoadMoreNews.value  = true;
}

await loadMoreTopics("finished");
await loadMoreTopics("notvoted");
await loadMoreTopics("voted");
await loadMoreNews();

</script>