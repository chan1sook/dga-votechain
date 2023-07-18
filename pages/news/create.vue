<template>
  <div>
    <DgaHead>{{ $t("news.create.title") }}</DgaHead>
    <div class="mx-auto my-4 grid max-w-7xl grid-cols-12 gap-4">
      <label class="col-span-12 md:col-span-2">
        {{ $t("news.newsTitle") }}
        <span class="text-red-500" :title="$t('news.required')">*</span>
      </label>
      <div class="col-span-12 md:col-span-10">
        <DgaInput
          v-model="newsData.title"
          type="text"
          :placeholder="$t('news.newsTitle')"
          class="w-full"
          required
        ></DgaInput>
      </div>
      <label class="col-span-12 md:col-span-2">{{ $t("news.author") }}</label>
      <div class="col-span-12 md:col-span-10">
        <DgaInput
          v-model="newsData.author"
          type="text"
          :placeholder="$t('news.author')"
          class="w-full"
        ></DgaInput>
      </div>
      <label class="col-span-12 md:col-span-2">
        {{ $t("news.content") }}
        <span class="text-red-500" :title="$t('news.required')">*</span>
      </label>
      <div class="col-span-12 md:col-span-10">
        <DgaRichtextEditor v-model="newsData.content"></DgaRichtextEditor>
      </div>
      <label class="col-span-12 md:col-span-2">{{
        $t("news.references")
      }}</label>
      <div class="col-span-12 md:col-span-10">
        <DgaInput
          v-model="newsData.references"
          type="text"
          :placeholder="$t('news.references')"
          class="w-full"
        ></DgaInput>
      </div>
      <label class="col-span-12 md:col-span-2">{{
        $t("news.publishTime.title")
      }}</label>
      <div class="col-span-12 flex flex-col gap-2 md:col-span-10 md:flex-row">
        <DgaInput
          v-model="publishDateStr"
          type="date"
          :placeholder="$t('news.publishTime.date')"
          class="w-full"
        ></DgaInput>
        <DgaInput
          v-model="publishTimeStr"
          type="time"
          :placeholder="$t('news.publishTime.time')"
          class="w-full"
        ></DgaInput>
      </div>
      <div class="col-span-12 flex flex-row items-center gap-2 md:col-span-2">
        <DgaCheckbox v-model="isNewsExpired"></DgaCheckbox>
        <label class="flex-none">{{ $t("news.newsExpired") }}</label>
      </div>
      <div class="col-span-12 flex flex-col gap-2 md:col-span-10 md:flex-row">
        <DgaInput
          v-model="expiredDateStr"
          type="date"
          :placeholder="$t('news.expiredTime.date')"
          :min="startExpiredDateStr"
          class="w-full"
          :disabled="!isNewsExpired"
        ></DgaInput>
        <DgaInput
          v-model="expiredTimeStr"
          type="time"
          :placeholder="$t('news.expiredTime.time')"
          class="w-full"
          :disabled="!isNewsExpired"
        ></DgaInput>
      </div>
      <DgaButtonGroup class="col-span-12 mt-4">
        <DgaButton
          class="mx-auto !flex flex-row items-center justify-center gap-x-2 truncate"
          color="dga-orange"
          :title="$t('news.create.action')"
          :disabled="!isFormValid"
          @click="showConfirmModal = true"
        >
          <NewspaperIcon />
          <span class="truncate">{{ $t("news.create.action") }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal
      :show="showConfirmModal"
      cancel-backdrop
      @confirm="createNews"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t("news.create.confirm") }}
    </DgaModal>
    <DgaLoadingModal :show="waitCreate"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import NewspaperIcon from "vue-material-design-icons/Newspaper.vue";

import dayjs from "dayjs";
import { isNewsFormValid, useWatchNewsDateTimes } from "~/src/utils/news";

definePageMeta({
  middleware: ["auth-dev"],
});

const i18n = useI18n();
const localePathOf = useLocalePath();

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "news.create.title"
  )}`,
});

const showConfirmModal = ref(false);
const waitCreate = ref(false);

const publishDate = dayjs(useComputedServerTime()).millisecond(0).toDate();
const expiredDate = dayjs(useComputedServerTime())
  .add(1, "year")
  .hour(0)
  .minute(0)
  .second(0)
  .millisecond(0)
  .toDate();

const publishDateStr = ref(dayjs(publishDate).format("YYYY-MM-DD"));
const publishTimeStr = ref(dayjs(publishDate).format("HH:mm"));
const expiredDateStr = ref(dayjs(expiredDate).format("YYYY-MM-DD"));
const expiredTimeStr = ref(dayjs(expiredDate).format("HH:mm"));
const startExpiredDateStr = computed(() =>
  dayjs(publishDateStr.value, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD")
);
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
const isFormValid = computed(() => isNewsFormValid(newsData.value));

useWatchNewsDateTimes(
  newsData,
  publishDateStr,
  publishTimeStr,
  expiredDateStr,
  expiredTimeStr,
  isNewsExpired
);

async function createNews() {
  if (!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitCreate.value = true;

  const { error } = await useFetch("/api/news/create", {
    method: "POST",
    body: newsData.value,
  });

  if (error.value) {
    useShowToast({
      title: i18n.t("news.create.action"),
      content: i18n.t("news.create.failed"),
      autoCloseDelay: 5000,
    });

    waitCreate.value = false;
  } else {
    useShowToast({
      title: i18n.t("news.create.action"),
      content: i18n.t("news.create.success"),
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/"));
  }
}
</script>
