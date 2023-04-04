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
      <DgaListGroup :items="txToLists(tx)" no-animation>
        <template #header="{item}">
          <template v-if="item.group === 'userid'">
            Voted <abbr title="Digital ID UserID">UserID</abbr>
          </template>
          <template v-else>
            #{{ item.key }}
          </template>
        </template>
        <template #content="{item}">
          <template v-if="item.group === 'choice'">
            <template v-if="tx.choice">
              {{ tx.choice }}
            </template>
            <span v-else class="italic">No Vote</span>
          </template>
          <template v-else>
            {{ item.value }}
          </template>
        </template>
      </DgaListGroup>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { webAppName } from "~~/src/utils/utils"
import { formatDateTime } from '~~/src/utils/datetime';

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


function txToLists(tx: TxResponseData) : Array<BasicListableItem<string, string>> {
  return [
    { key: "TX ID", value: tx._id },
    { key: "Timestamp", value: formatDateTime(tx.createdAt) },
    { key: "", value: tx.userid, group: "userid" },
    { key: "Voted Topic ID", value: tx.topicid },
    { key: "Choice", value: "", group: "choice" }
  ]
}

</script>
