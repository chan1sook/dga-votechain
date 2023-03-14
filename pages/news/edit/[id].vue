<template>
    <div class="p-4 w-full mx-auto">
      <div class="border-2 border-gray-200 rounded-lg shadow p-4">
        <h1 class="text-3xl font-bold text-center mb-4">
          {{ webAppName }}
        </h1>
        <h2 class="text-2xl font-bold text-center mb-4">
          Edit News
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto my-4">
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Title</label>
            <input v-model="newsData.title" type="text" class="dga-evote-input w-0 flex-1" placeholder="News title"/>
            <span class="text-red-500" title="Required">*</span>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Author</label>
            <input v-model="newsData.author" type="text" class="dga-evote-input w-0 flex-1" placeholder="News author"/>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-start gap-2">
            <label class="flex-none">Content</label>
            <textarea v-model="newsData.content" class="dga-evote-input w-0 flex-1 h-32" placeholder="News content"></textarea>
            <span class="text-red-500" title="Required">*</span>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">References</label>
            <input v-model="newsData.references" type="text" class="dga-evote-input w-0 flex-1" placeholder="News references"/>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Publish Time</label>
            <input v-model="publishDateStr" type="date" class="dga-evote-input w-0 flex-1" placeholder="Publish Date"/>
            <input v-model="publishTimeStr" type="time" class="dga-evote-input w-0 flex-1" placeholder="Publish Time"/>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <input v-model="isNewsExpired" type="checkbox" class="scale-125" />
            <label class="flex-none">Expired</label>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Expired Time</label>
            <input v-model="expiredDateStr" type="date" class="dga-evote-input w-0 flex-1" :min="startExpiredDateStr" placeholder="Expired Date" :disabled="!isNewsExpired"/>
            <input v-model="expiredTimeStr" type="time" class="dga-evote-input w-0 flex-1" placeholder="Expired Time" :disabled="!isNewsExpired"/>
          </div>
          <div class="md:col-span-2 my-2 text-center">
            <button type="button" class="dga-evote-btn w-full max-w-sm inline-flex gap-2 items-center justify-center" title="Edit News" :disabled="!isFormValid" @click="editNews">
              <MaterialIcon icon="edit" />
              <span class="truncate">Edit News</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import dayjs from "dayjs";
import { isNewsFormValid, useWatchNewsDateTimes } from "~~/src/utils/news"
import { goBack, webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-admin"]
})

const { id: newsid } = useRoute().params;

useHead({
  title: `${webAppName} - Edit News`
});

const { data } = await useFetch(`/api/news/info/${newsid}`);

const publishDate = dayjs().millisecond(0).toDate();
const expiredDate = dayjs().add(1, "year").hour(0).minute(0).second(0).millisecond(0).toDate();

const publishDateStr = ref(dayjs(publishDate).format("YYYY-MM-DD"))
const publishTimeStr = ref(dayjs(publishDate).format("HH:MM"))
const expiredDateStr = ref(dayjs(expiredDate).format("YYYY-MM-DD"))
const expiredTimeStr = ref(dayjs(expiredDate).format("HH:MM"))
const startExpiredDateStr = computed(() => dayjs(publishDateStr.value, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD"))
const isNewsExpired = ref(false);

const newsData = ref<NewsFormData>({
  title: "",
  visibility: "public",
  author: "",
  content: "",
  references: "",
  newsPublishAt: publishDate,
  newsExpiredAt: null,
});
const isFormValid = computed(() => isNewsFormValid(newsData.value))

useWatchNewsDateTimes(newsData, publishDateStr, publishTimeStr, expiredDateStr, expiredTimeStr, isNewsExpired)

if (!data.value) {
  showError("Topic not found");
} else {
  const { news } = data.value;
  newsData.value.title = news.title;
  newsData.value.visibility = news.visibility;
  newsData.value.author = news.author;
  newsData.value.content = news.content;
  newsData.value.references = news.references;
  newsData.value.newsPublishAt = dayjs(news.newsPublishAt).toDate();
  newsData.value.newsExpiredAt = news.newsExpiredAt ? dayjs(news.newsExpiredAt).toDate() : null;
}

async function editNews() {
  if(!isFormValid.value) {
    return;
  }
  
  const { data } = await useFetch(`/api/news/edit/${newsid}`, {
    method: "POST",
    body: newsData.value,
  });

  goBack();
}
</script>