<template>
  <div v-if="topic" class="dga-container">
    <h1 class="text-3xl font-bold text-center mb-4">
      {{ webAppName }}
    </h1>
    <h2 class="text-2xl font-bold text-center mb-0">
      Topic Info
    </h2>
    <div class="text-sm text-center text-gray-700 mb-4">#{{ topicid }}</div>
    <DgaListGroup :items="topicToLists(topic)" no-animation>
      <template #content="{item}">
        <template v-if="item.group === 'yesno'">
          <span class="inline-flex flex-row gap-x-2 items-center">
            <template  v-if="item.value === 'Yes'">
              <MaterialIcon icon="check" /> Yes
            </template>
            <template v-else>
              <MaterialIcon icon="close" /> No
            </template>
          </span>
        </template>
        <template v-else>
          {{ item.value }}
        </template>
      </template>
    </DgaListGroup>
    <DgaButtonGroup v-if="isTopicNotApproved" class="mt-12">
      <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
        color="dga-orange" title="Approve Topic" @click="setTopicStatus('approved')"
      >
        <MaterialIcon icon="check" />
        <span class="truncate">Approve</span>
      </DgaButton>
      <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
        title="Reject Topic" @click="setTopicStatus('rejected')"
      >
        <MaterialIcon icon="close" />
        <span class="truncate">Reject</span>
      </DgaButton>
    </DgaButtonGroup>
    <DgaButtonGroup :class="[isTopicNotApproved ? 'mt-2' : 'mt-12' ]">
      <NuxtLink :to="`/topic/edit/${topicid}`">
        <DgaButton class="w-full flex flex-row gap-x-2 items-center justify-center truncate" title="Edit Topic">
          <MaterialIcon icon="edit" />
          <span class="truncate">Edit Topic</span>
        </DgaButton>
      </NuxtLink>
    </DgaButtonGroup>
  </div>
</template>
  
<script setup lang="ts">
import { toFirstCapitalState, webAppName } from "~~/src/utils/utils"
import { formatDateTime } from '~~/src/utils/datetime';
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
  return checkPermissionNeeds(useSessionData().value.permissions, "access-pages:admin");
})
const isTopicNotApproved = computed(() => isAdminRole.value && topic.value && topic.value.status === 'pending')

const { data } = await useFetch(`/api/topic/info/${topicid}`);

const topic: Ref<TopicResponseData | undefined> = ref(undefined);

if (!data.value) {
  showError("Topic not found");
} else {
  const { topic: _topic } = data.value;
  topic.value = _topic;
}

function topicToLists(topic: TopicResponseData) : Array<BasicListableItem<string, string, string>> {
  return [
    { key: "Topic ID", value: topic._id },
    { key: "Created Time", value: formatDateTime(topic.createdAt) },
    { key: "Updated Time", value: formatDateTime(topic.updatedAt) },
    { key: "Status", value: toFirstCapitalState(topic.status) },
    { key: "Name", value: topic.name },
    { key: "Description", value: topic.description },
    { key: "Choices", value: topic.choices.choices.map((ele) => ele.name).join(", ") },
    { key: "Voter Custom", value: topic.choices.customable ? "Yes" : "No", group: "yesno" },
    { key: "Voteable", value: isTopicExpired(topic) ? "Yes" : "No", group: "yesno" },
    { key: "Expired", value: isTopicExpired(topic) ? "Yes" : "No", group: "yesno" }
  ]
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
