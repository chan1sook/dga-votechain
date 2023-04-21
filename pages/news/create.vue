<template>
  <div>
    <DgaHead>{{ $t('news.create.title')}}</DgaHead>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto my-4">
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <label class="flex-none">{{ $t('news.newsTitle') }}</label>
        <DgaInput v-model="newsData.title" type="text" :placeholder="$t('news.newsTitle')" class="flex-1" required></DgaInput>
        <span class="text-red-500" :title="$t('news.required')">*</span>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <label class="flex-none">{{ $t('news.author') }}</label>
        <DgaInput v-model="newsData.author" type="text" :placeholder="$t('news.author')" class="flex-1"></DgaInput>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-start gap-2">
        <label class="flex-none">{{ $t('news.content') }}</label>
        <DgaTextArea v-model="newsData.content" type="text" :placeholder="$t('news.content')" class="flex-1" required></DgaTextArea>
        <span class="text-red-500" :title="$t('news.required')">*</span>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <label class="flex-none">{{ $t('news.references') }}</label>
        <DgaInput v-model="newsData.references" type="text" :placeholder="$t('news.references')" class="flex-1"></DgaInput>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <label class="flex-none">{{ $t('news.publishTime.title') }}</label>
        <DgaInput v-model="publishDateStr" type="date" :placeholder="$t('news.publishTime.date')" class="flex-1"></DgaInput>
        <DgaInput v-model="publishTimeStr" type="time" :placeholder="$t('news.publishTime.time')" class="flex-1"></DgaInput>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="isNewsExpired"></DgaCheckbox>
        <label class="flex-none">{{ $t('news.newsExpired') }}</label>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <DgaInput v-model="expiredDateStr" type="date" :placeholder="$t('news.expiredTime.date')" :min="startExpiredDateStr" class="flex-1" :disabled="!isNewsExpired"></DgaInput>
        <DgaInput v-model="expiredTimeStr" type="time" :placeholder="$t('news.expiredTime.time')" class="flex-1" :disabled="!isNewsExpired"></DgaInput>
      </div>
      <DgaButtonGroup class="md:col-span-2 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center mx-auto justify-center truncate"
          color="dga-orange" :title="$t('news.create.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <MaterialIcon icon="newspaper" />
          <span class="truncate">{{ $t('news.create.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="createNews"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('news.create.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitCreate"></DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import dayjs from "dayjs";
import { getComputedServerTime as serverTime } from "~~/src/utils/datetime";
import { isNewsFormValid, useWatchNewsDateTimes } from "~~/src/utils/news"

definePageMeta({
  middleware: ["auth-admin"]
})

const i18n = useI18n();
const localePathOf = useLocalePath();

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('news.create.title')}`
});

const showConfirmModal = ref(false);
const waitCreate = ref(false);

const publishDate = dayjs(serverTime()).millisecond(0).toDate();
const expiredDate = dayjs(serverTime()).add(1, "year").hour(0).minute(0).second(0).millisecond(0).toDate();

const publishDateStr = ref(dayjs(publishDate).format("YYYY-MM-DD"))
const publishTimeStr = ref(dayjs(publishDate).format("HH:mm"))
const expiredDateStr = ref(dayjs(expiredDate).format("YYYY-MM-DD"))
const expiredTimeStr = ref(dayjs(expiredDate).format("HH:mm"))
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

  showConfirmModal.value = false;
  waitCreate.value = true;
  
  const { error } = await useFetch("/api/news/create", {
    method: "POST",
    body: newsData.value,
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('news.create.action'),
      content: i18n.t('news.create.failed'),
      autoCloseDelay: 5000,
    });
  
    waitCreate.value = false;
  } else {
    useShowToast({
      title: i18n.t('news.create.action'),
      content: i18n.t('news.create.success') ,
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/"))
  }
}
</script>