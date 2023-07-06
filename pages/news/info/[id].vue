<template>
  <div v-if="news">
    <DgaHead>{{ $t("news.title")}}</DgaHead>
    <h2 class="text-2xl font-bold text-center mb-0">
      {{ news.title }}
    </h2>
    <div class="grid-2-news">
      <div>{{ $t('news.id') }}</div>
      <div>{{ news._id }}</div>
      <div>{{ $t('news.author') }}</div>
      <div>
        <span v-if="news.author">{{ news.author }}</span>
        <span v-else class="italic">{{ $t('app.anonymous') }}</span>
      </div>
      <div>{{ $t('news.publishAt') }}</div>
      <div>{{ $d(dayjs(news.newsPublishAt).toDate(), "long") }}</div>
      <div>{{ $t('news.content') }}</div>
      <div class="custom-content-container" v-html="sanitizeHtmlCustom(news.content)"></div>
      <div>{{ $t('news.references') }}</div>
      <div>
        <template v-if="news.references">{{ news.references }}</template>
        <span v-else class="italic">{{  $t('news.noReference') }}</span>
      </div>
    </div>
    <DgaButtonGroup class="mt-12">
      <NuxtLink v-if="isAdminRole" :to="`/news/edit/${newsid}`" >
        <DgaButton class="!flex flex-row gap-x-2 mx-auto items-center justify-center truncate"
          color="dga-orange" :title="$t('news.edit.title')"
        >
          <PencilIcon />
          <span class="truncate">{{ $t('news.edit.title') }}</span>
        </DgaButton>
      </NuxtLink>
    </DgaButtonGroup>
  </div>
</template>
  
<script setup lang="ts">
import PencilIcon from 'vue-material-design-icons/Pencil.vue';
import { sanitizeHtmlCustom } from '~/src/services/formatter/html';

import dayjs from "dayjs";

definePageMeta({
  middleware: ["auth-voter"]
})

const i18n = useI18n();

const { id } = useRoute().params;
let newsid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('news.title')} #${newsid}`
});

const isAdminRole = computed(() => {
  return useSessionData().value.roleMode === "admin";
})

const { data } = await useFetch(`/api/news/info/${newsid}`);

const news: Ref<NewsResponseData | undefined> = ref(undefined);

if (!data.value) {
  showError("News not found");
} else {
  const { news: _news } = data.value;
  news.value = _news;
}
</script>

<style scoped>
.grid-2-news {
  @apply grid gap-x-4 gap-y-2;
  grid-template-columns: max-content auto;
}

</style>