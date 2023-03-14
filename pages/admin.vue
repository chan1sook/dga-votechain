<template>
  <div class="p-4 w-full mx-auto">
    <div class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-4">
        Admin
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-7xl mx-auto my-4">
        <BasicCard>
          <template #header>รายการโหวต</template>
          <div v-if="loadedTopics.available.length > 0" class="p-2 overflow-auto max-h-60">
            <NuxtLink v-for="(topic, i) of loadedTopics.available" :to="`/topic/info/${topic._id}`">
              <BasicListItem>
                <template #header>{{ i + 1 }}.</template>
                {{ topic.name }}
              </BasicListItem>
            </NuxtLink>
            <template v-if="hasMoreTopics.available">
              <div v-if="!isLoadMoreTopics.available" class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
                <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Load More Topic" @click="loadMoreTopics('available')">
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
          <template #header>รายการโหวตรออนุมัติ</template>
          <div v-if="loadedTopics.pending.length > 0" class="p-2 overflow-auto max-h-60">
            <NuxtLink v-for="(topic, i) of loadedTopics.pending" :to="`/topic/info/${topic._id}`">
              <BasicListItem>
                <template #header>{{ i + 1 }}.</template>
                {{ topic.name }}
              </BasicListItem>
            </NuxtLink>
            <template v-if="hasMoreTopics.pending">
              <div v-if="!isLoadMoreTopics.pending" class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
                <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Load More Topic" @click="loadMoreTopics('pending')">
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
      </div>
      <div class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
        <NuxtLink to="/topic/create" class="w-full sm:w-48 block">
          <button type="button" class="dga-evote-btn w-full inline-flex gap-2 items-center justify-center" title="ตั้งโหวต">
            <MaterialIcon icon="ballot" />
            <span class="truncate">ตั้งโหวต</span>
          </button>
        </NuxtLink>
        <NuxtLink to="/news/create" class="w-full sm:w-48 block">
          <button type="button" class="dga-evote-btn w-full inline-flex gap-2 items-center justify-center" title="ตั้งกระดานข่าว">
            <MaterialIcon icon="newspaper" />
            <span class="truncate">ตั้งกระดานข่าว</span>
          </button>
        </NuxtLink>
        <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="สลับโหมด" @click="swapNextMode">
          <MaterialIcon icon="autorenew" />
          <span class="truncate">สลับโหมด</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { formatDateTime, webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-admin"]
});

useHead({
  title: `${webAppName} - Admin Page`
});

const isDeveloperRole = computed(() => {
  return checkPermissionNeeds(usePermissions().value, "access-pages:developer")
})

const loadedTopics : Ref<{
  pending: Array<TopicResponseData>,
  available: Array<TopicResponseData>,
}> = ref({
  pending: [],
  available: [], 
});
const news: Ref<Array<NewsResponseData>> = ref([]);

const pagesize = ref(50);
const startids = computed(() => {
  const pendingStartid = loadedTopics.value.pending.length > 0 ? 
    loadedTopics.value.pending[loadedTopics.value.pending.length - 1]._id : undefined;
  const availableStartid = loadedTopics.value.available.length > 0 ? 
    loadedTopics.value.available[loadedTopics.value.available.length - 1]._id : undefined;
  const newsStartid = news.value.length > 0 ? news.value[news.value.length - 1]._id : undefined;
  return {
    pending: pendingStartid,
    available: availableStartid,
    news: newsStartid,
  }
})
const hasMoreTopics = ref({
  pending: false,
  available: false,
});
const hasMoreNews = ref(false);
const isLoadMoreTopics = ref({
  pending: false,
  available: false,
});
const isLoadMoreNews = ref(false);

function swapNextMode(event: MouseEvent) {
  navigateTo(isDeveloperRole.value ? "/developer" : "/")
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

async function loadMoreTopics(type: "available" | "pending") {
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

await loadMoreTopics("available")
await loadMoreTopics("pending")
await loadMoreNews()

</script>