<template>
  <div class="p-4 w-full mx-auto">
    <div v-if="tx" class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-0">
        TX Info
      </h2>
      <div class="text-sm text-center text-gray-700 mb-4">#{{ txid }}</div>
      <div class="my-2">
        <BasicListItem header-class="w-40">
          <template #header>TX ID</template>
          {{ tx._id }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Timestamp</template>
          {{ formatDateTime(tx.createdAt) }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Voted <abbr title="Digital ID UserID">UserID</abbr></template>
          {{ tx.userid }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Voted Topic ID</template>
          {{ tx.topicid }}
        </BasicListItem>
        <BasicListItem header-class="w-40">
          <template #header>Choice</template>
          <template v-if="tx.choice">
            {{ tx.choice }}
          </template>
          <span v-else class="italic">No Vote</span>
        </BasicListItem>
      </div>
      <div class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
        <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Back" @click="goBack">
          <span class="truncate">Back</span>
        </button>
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { formatDateTime, goBack, webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-dev"]
})

const { id: txid } = useRoute().params;

useHead({
  title: `${webAppName} - TX Info #${txid}`
});

const { data } = await useFetch(`/api/tx/${txid}`);

const tx: Ref<TxResponseData | undefined> = ref(undefined);

if (!data.value) {
  showError("TX not found");
} else {
  tx.value = data.value.tx;
}

</script>
