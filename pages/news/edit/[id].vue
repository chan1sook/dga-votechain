<template>
  <div>
    <DgaHead>{{ $t('news.edit.title') }}</DgaHead>
    <div class="grid grid-cols-12 gap-4 max-w-7xl mx-auto my-4">
      <label class="col-span-12 md:col-span-2">
        {{ $t('news.newsTitle') }}
        <span class="text-red-500" :title="$t('news.required')">*</span>
      </label>
      <div class="col-span-12 md:col-span-10">
        <DgaInput v-model="newsData.title" type="text" :placeholder="$t('news.newsTitle')" class="w-full" required></DgaInput>
      </div>
      <label class="col-span-12 md:col-span-2">{{ $t('news.author') }}</label>
      <div class="col-span-12 md:col-span-10">
        <DgaInput v-model="newsData.author" type="text" :placeholder="$t('news.author')" class="w-full"></DgaInput>
      </div>
      <label class="col-span-12 md:col-span-2">
        {{ $t('news.content') }} 
        <span class="text-red-500" :title="$t('news.required')">*</span>
      </label>
      <div class="col-span-12 md:col-span-10">
        <DgaRichtextEditor v-model="newsData.content"></DgaRichtextEditor>
      </div>
      <label class="col-span-12 md:col-span-2">{{ $t('news.references') }}</label>
      <div class="col-span-12 md:col-span-10">
        <DgaInput v-model="newsData.references" type="text" :placeholder="$t('news.references')" class="w-full"></DgaInput>
      </div>
      <label class="col-span-12 md:col-span-2">{{ $t('news.publishTime.title') }}</label>
      <div class="col-span-12 md:col-span-10 flex flex-col md:flex-row gap-2">
        <DgaInput v-model="publishDateStr" type="date" :placeholder="$t('news.publishTime.date')" class="w-full"></DgaInput>
        <DgaInput v-model="publishTimeStr" type="time" :placeholder="$t('news.publishTime.time')" class="w-full"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-2 flex flex-row items-center gap-2">
        <DgaCheckbox v-model="isNewsExpired"></DgaCheckbox>
        <label class="flex-none">{{ $t('news.newsExpired') }}</label>
      </div>
      <div class="col-span-12 md:col-span-10 flex flex-col md:flex-row gap-2">
        <DgaInput v-model="expiredDateStr" type="date" :placeholder="$t('news.expiredTime.date')" :min="startExpiredDateStr" class="w-full" :disabled="!isNewsExpired"></DgaInput>
        <DgaInput v-model="expiredTimeStr" type="time" :placeholder="$t('news.expiredTime.time')" class="w-full" :disabled="!isNewsExpired"></DgaInput>
      </div>
      <DgaButtonGroup class="col-span-12 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center mx-auto justify-center truncate"
          color="dga-orange" :title="$t('news.edit.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <NewspaperIcon />
          <span class="truncate">{{ $t('news.edit.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="editNews"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('news.edit.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import NewspaperIcon from 'vue-material-design-icons/Newspaper.vue';

import dayjs from "dayjs";
import { isNewsFormValid, useWatchNewsDateTimes } from "~/src/utils/news"

definePageMeta({
  middleware: ["auth-dev"]
})

const i18n = useI18n();
const localePathOf = useLocalePath();

const { id: newsid } = useRoute().params;

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('news.create.edit')}`
});

const { data } = await useFetch(`/api/news/info/${newsid}`);

const showConfirmModal = ref(false);
const waitEdit = ref(false);

const publishDate = dayjs(useComputedServerTime()).millisecond(0).toDate();
const expiredDate = dayjs(useComputedServerTime()).add(1, "year").hour(0).minute(0).second(0).millisecond(0).toDate();

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

  showConfirmModal.value = false;
  waitEdit.value = true;
  
  const { error } = await useFetch(`/api/news/edit/${newsid}`, {
    method: "POST",
    body: newsData.value,
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('news.edit.action'),
      content: i18n.t('news.edit.failed'),
      autoCloseDelay: 5000,
    });
  
    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t('news.edit.action'),
      content: i18n.t('news.edit.success') ,
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/"))
  }
}
</script>