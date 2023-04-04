<template>
  <div>
    <DgaHead>Create News</DgaHead>
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
        <DgaCheckbox v-model="isNewsExpired"></DgaCheckbox> 
        <label class="flex-none">Expired</label>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <label class="flex-none">Expired Time</label>
        <input v-model="expiredDateStr" type="date" class="dga-evote-input w-0 flex-1" :min="startExpiredDateStr" placeholder="Expired Date" :disabled="!isNewsExpired"/>
        <input v-model="expiredTimeStr" type="time" class="dga-evote-input w-0 flex-1" placeholder="Expired Time" :disabled="!isNewsExpired"/>
      </div>
      <DgaButtonGroup class="md:col-span-2 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center mx-auto justify-center truncate"
          color="dga-orange" title="Create News" :disabled="!isFormValid" @click="createNews"
        >
          <MaterialIcon icon="newspaper" />
          <span class="truncate">Create News</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import dayjs from "dayjs";
import { getComputedServerTime as serverTime } from "~~/src/utils/datetime";
import { isNewsFormValid, useWatchNewsDateTimes } from "~~/src/utils/news"
import { goBack, webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${webAppName} - Create News`
});

const publishDate = dayjs(serverTime()).millisecond(0).toDate();
const expiredDate = dayjs(serverTime()).add(1, "year").hour(0).minute(0).second(0).millisecond(0).toDate();

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

async function createNews() {
  if(!isFormValid.value) {
    return;
  }
  
  const { data } = await useFetch("/api/news/create", {
    method: "POST",
    body: newsData.value,
  });

  goBack();
}
</script>