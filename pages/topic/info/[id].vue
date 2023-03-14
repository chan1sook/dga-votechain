<template>
  <div class="p-4 w-full mx-auto">
    <div v-if="topic" class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-0">
        Topic Info
      </h2>
      <div class="text-sm text-center text-gray-700 mb-4">#{{ topicid }}</div>
      <div class="my-2">
        <BasicListItem header-class="w-40">
          <template #header>Topic ID</template>
          {{ topic._id }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Created Time</template>
          {{ formatDateTime(topic.createdAt) }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Updated Time</template>
          {{ formatDateTime(topic.updatedAt) }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Status</template>
          {{ toFirstCapitalState(topic.status) }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Name</template>
          {{ topic.name }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Description</template>
          {{ topic.description }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Choices</template>
          {{ topic.choices.choices.map((ele) => ele.name).join(", ") }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>User customable</template>
          <template v-if="topic.choices.customable">
            <MaterialIcon icon="check" /> Yes
          </template>
          <template v-else>
            <MaterialIcon icon="Close" /> No
          </template>
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Voteable</template>
          <template v-if="isTopicExpired(topic)">
            <MaterialIcon icon="check" /> Yes
          </template>
          <template v-else>
            <MaterialIcon icon="Close" /> No
          </template>
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Expired</template>
          <template v-if="isTopicExpired(topic)">
            <MaterialIcon icon="check" /> Yes
          </template>
          <template v-else>
            <MaterialIcon icon="Close" /> No
          </template>
        </BasicListItem>
      </div>
      <div v-if="topic.status === 'pending'" class="my-2 flex flex-col sm:flex-row sm:justify-center items-center flex-wrap gap-2">
        <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Approve Topic" @click="setTopicStatus('approved')">
          <MaterialIcon icon="check" />
          <span class="truncate">Approve Topic</span>
        </button>
        <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Reject Topic" @click="setTopicStatus('rejected')">
          <MaterialIcon icon="close" />
          <span class="truncate">Reject Topic</span>
        </button>
      </div>
      <div class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
        <NuxtLink v-if="isAdminRole" :to="`/topic/edit/${topicid}`" class="w-full sm:w-64 block">
          <button type="button" class="dga-evote-btn w-full inline-flex gap-2 items-center justify-center" title="Edit Topic">
            <MaterialIcon icon="edit" />
            <span class="truncate">Edit Topic</span>
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
import { formatDateTime, goBack, toFirstCapitalState, webAppName } from "~~/src/utils/utils"
import { isTopicExpired } from "~~/src/utils/topic";
import { checkPermissionNeeds } from "~~/src/utils/permissions";

definePageMeta({
  middleware: ["auth-voter"]
})

const { id } = useRoute().params;
let topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${webAppName} - Topic Info #${topicid}`
});

const isAdminRole = computed(() => {
  return checkPermissionNeeds(usePermissions().value, "access-pages:admin");
})

const { data } = await useFetch(`/api/topic/info/${topicid}`);

const topic: Ref<TopicResponseData | undefined> = ref(undefined);

if (!data.value) {
  showError("Topic not found");
} else {
  const { topic: _topic } = data.value;
  topic.value = _topic;
}

async function setTopicStatus(status: TopicStatus) {
  const { data } = await useFetch(`/api/topic/edit/${topicid}`, {
    method: "POST",
    body: {
      status
    }
  })

  if(data.value) {
    topic.value = data.value.topic;
  }
}
</script>
