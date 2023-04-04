<template>
  <div class="relative">
    <button type="button" @click="toggleShowOption" title="News">
      <MaterialIcon icon="mail"></MaterialIcon>
    </button>
    <Teleport to="body">
      <div v-if="showOption" class="z-[400] bg-white border rounded-md rounded-b-3xl shadow fixed right-0 top-20 w-72 h-64 max-h-96 overflow-y-auto">
        <div class="flex-1 flex flex-col gap-2 px-4 py-2">
          <DgaHead>News</DgaHead>
          <NuxtLink v-for="newsData of loadedNews" :href="`/news/info/${newsData._id}`" @click="useVisibleMenu().value = undefined">
            <h3 class="font-bold">{{ newsData.title }}</h3>
            <div class="text-xs">
              {{ formatDateTime(newsData.createdAt) }} - <b>{{ newsData.author }}</b>
            </div>
          </NuxtLink>
          <template v-if="isLoadMoreNews">
            <div class="text-center text-xl italic">
              Loading...
            </div>
          </template>
          <template v-else>
            <div v-if="loadedNews.length === 0 && !hasMoreNews" class="text-center text-xl italic">
              No more news
            </div>
            <DgaButton v-if="hasMoreNews && isLoadMoreNews" color="dga-orange" class="mx-auto" @click="loadMoreNews">Load more news</DgaButton>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~~/src/utils/datetime';

const showOption = computed(() => useVisibleMenu().value === 'news');
const loadedNews : Ref<Array<NewsResponseData>> = ref([]);

const pagesize = ref(50);
const startid = computed(() => {
  return loadedNews.value.length > 0 ? loadedNews.value[loadedNews.value.length - 1]._id : undefined;
})
const hasMoreNews = ref(false);
const isLoadMoreNews = ref(false);

function toggleShowOption() {
  if(!showOption.value) {
    useVisibleMenu().value = 'news';
    loadedNews.value = [];
    loadMoreNews();
  } else {
    useVisibleMenu().value = undefined;
  }
}

async function fetchNews(pagesize: number, startid?: string) {
  const fetchResult = await Promise.all([
    useFetch("/api/news", {
      query: { pagesize, startid }
    })
  ])

  const [ notifications ] = fetchResult.map((ele) => ele.data.value);
  return notifications;
}


async function loadMoreNews() {
  isLoadMoreNews.value = true;
  
  const news = await fetchNews(pagesize.value, startid.value);
  if(news) {
    loadedNews.value.push(...news.news);
    hasMoreNews.value = news.news.length === pagesize.value;
  }
  isLoadMoreNews.value = false;
}

</script>

<style scoped>
</style>