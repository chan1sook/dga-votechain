<template>
  <div class="relative" @click.stop>
    <button
      type="button"
      @click="toggleShowOption"
      :title="$t('app.navbar.news.title')"
    >
      <NewspaperIcon />
    </button>
    <div
      v-if="showOption"
      class="fixed right-0 top-16 z-[400] max-h-[400px] w-72 overflow-y-auto rounded-md rounded-b-3xl border bg-white shadow lg:top-20"
      @click.stop
    >
      <div class="flex flex-1 flex-col gap-2 px-4 py-2">
        <DgaHead>{{ $t("app.navbar.news.title") }}</DgaHead>
        <div v-if="isDeveloperRole(roleMode)" class="absolute right-0 top-2">
          <NuxtLink
            :href="localePathOf('/news/create')"
            :title="$t('app.navbar.news.add')"
            @click="useVisibleMenuGroup().value = undefined"
          >
            <PlusIcon />
          </NuxtLink>
        </div>
        <NuxtLink
          v-for="newsData of loadedNews"
          :href="localePathOf(`/news/info/${newsData._id}`)"
          @click="useVisibleMenuGroup().value = undefined"
        >
          <h3 class="font-bold">{{ newsData.title }}</h3>
          <div class="text-xs">
            {{ prettyDateTime(newsData.createdAt) }} -
            <b>{{ newsData.author }}</b>
          </div>
        </NuxtLink>
        <template v-if="isLoadMoreNews">
          <div class="text-center text-xl italic">
            {{ $t("app.navbar.news.loadingNews") }}
          </div>
        </template>
        <template v-else>
          <div
            v-if="loadedNews.length === 0 && !hasMoreNews"
            class="text-center text-xl italic"
          >
            {{ $t("app.navbar.news.noMoreNews") }}
          </div>
          <DgaButton
            v-if="hasMoreNews && isLoadMoreNews"
            :title="$t('app.navbar.news.loadMoreNews')"
            color="dga-orange"
            class="mx-auto"
            @click="loadMoreNews"
          >
            {{ $t("app.navbar.news.loadMoreNews") }}
          </DgaButton>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NewspaperIcon from "vue-material-design-icons/Newspaper.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";

import dayjs from "dayjs";
import { isDeveloperRole } from "~/src/services/validations/role";

const i18t = useI18n();
const localePathOf = useLocalePath();

const showOption = computed(() => useVisibleMenuGroup().value === "news");
const loadedNews: Ref<NewsResponseData[]> = ref([]);

const pagesize = ref(50);
const startid = computed(() => {
  return loadedNews.value.length > 0
    ? loadedNews.value[loadedNews.value.length - 1]._id
    : undefined;
});
const hasMoreNews = ref(false);
const isLoadMoreNews = ref(false);

const roleMode = computed(() => useSessionData().value.roleMode);

function prettyDateTime(date: any) {
  return i18t.d(dayjs(date).toDate(), "short");
}
function toggleShowOption() {
  if (!showOption.value) {
    useVisibleMenuGroup().value = "news";
    loadedNews.value = [];
    loadMoreNews();
  } else {
    useVisibleMenuGroup().value = undefined;
  }
}

async function fetchNews(pagesize: number, startid?: string) {
  const fetchResult = await Promise.all([
    useFetch("/api/news", {
      query: { pagesize, startid },
    }),
  ]);

  const [notifications] = fetchResult.map((ele) => ele.data.value);
  return notifications;
}

async function loadMoreNews() {
  isLoadMoreNews.value = true;

  const news = await fetchNews(pagesize.value, startid.value);
  if (news) {
    loadedNews.value.push(...news.news);
    hasMoreNews.value = news.news.length === pagesize.value;
  }
  isLoadMoreNews.value = false;
}
</script>

<style scoped></style>
