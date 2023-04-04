<template>
  <div v-if="news">
    <DgaHead>News</DgaHead>
    <h2 class="text-2xl font-bold text-center mb-0">
      {{ news.title }}
    </h2>
    <div class="text-sm text-center text-gray-700 mb-4">#{{ newsid }}</div>
    <DgaListGroup :items="newToLists(news)" no-animation>
      <template #header="{item}">
        {{ item.key }}
      </template>
      <template #content="{item}">
        <template v-if="item.key === 'Author'">
          <span v-if="item.value.author">{{ item.value.author }}</span>
          <span v-else class="italic">Anonymous</span>
        </template>
        <template v-else-if="item.key === 'Published At'">
          {{ formatDateTime(item.value.newsPublishAt) }}
        </template>
        <template v-else-if="item.key === 'Content'">
          <SimpleContentFormatter :content="item.value.content"></SimpleContentFormatter>
        </template>
        <template v-else-if="item.key === 'References'">
          <template v-if="item.value.references">{{ item.value.references }}</template>
          <span v-else class="italic">None</span>
        </template>
      </template>
    </DgaListGroup>
    <DgaButtonGroup class="mt-12">
      <NuxtLink v-if="isAdminRole" :to="`/news/edit/${newsid}`" >
        <DgaButton class="!flex flex-row gap-x-2 mx-auto items-center justify-center truncate"
          color="dga-orange"  title="Edit News"
        >
        <MaterialIcon icon="edit" />
          <span class="truncate">Edit News</span>
        </DgaButton>
      </NuxtLink>
    </DgaButtonGroup>
  </div>
</template>
  
<script setup lang="ts">
import { webAppName } from "~~/src/utils/utils"
import { formatDateTime } from '~~/src/utils/datetime';

definePageMeta({
  middleware: ["auth-voter"]
})

const { id } = useRoute().params;
let newsid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${webAppName} - News #${newsid}`
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

function newToLists(news: NewsResponseData) : Array<BasicListableItem<string, NewsResponseData>> {
  return [
    { key: "Author", value: news },
    { key: "Published At", value: news},
    { key: "Content", value: news},
    { key: "References", value: news },
  ];
}

</script>
