<template>
  <div class="p-4 w-full mx-auto">
    <div v-if="news" class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-0">
        {{ news.title }}
      </h2>
      <div class="text-sm text-center text-gray-700 mb-4">#{{ newsid }}</div>
      <div class="my-2">
        <BasicListItem header-class="w-24">
          <template #header>Author</template>
          <template v-if="news.author">{{ news.author }}</template>
          <span v-else class="italic">Anonymous</span>
        </BasicListItem>
        <BasicListItem header-class="w-24">
          <template #header>Publish At</template>
          {{ formatDateTime(news.newsPublishAt) }}
        </BasicListItem>
      </div>
      <hr />
      <div class="my-4">
        <p v-for="content of news.content.split('\n')" class="empty:my-4 peer-empty:my-0">{{ content }}</p>
      </div>
      <hr />
      <div class="my-2">
        <BasicListItem header-class="w-32">
          <template #header>References</template>
          <template v-if="news.references">{{ news.references }}</template>
          <span v-else class="italic">None</span>
        </BasicListItem>
      </div>
      <div class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
        <NuxtLink v-if="isAdminRole" :to="`/news/edit/${newsid}`" class="w-full sm:w-64 block">
          <button type="button" class="dga-evote-btn w-full inline-flex gap-2 items-center justify-center" title="Edit News">
            <MaterialIcon icon="edit" />
            <span class="truncate">Edit News</span>
          </button>
        </NuxtLink>
        <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Back" @click="goBack">
          <span class="truncate">Back</span>
        </button>
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import { formatDateTime, goBack, webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-voter"]
})

const { id } = useRoute().params;
let newsid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${webAppName} - News #${newsid}`
});

const isAdminRole = computed(() => {
  return checkPermissionNeeds(usePermissions().value, "access-pages:admin");
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
