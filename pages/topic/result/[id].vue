<template>
  <div class="p-4 w-full mx-auto">
    <div v-if="voteResult" class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-0">
        Vote Result
      </h2>
      <div class="text-base font-bold text-center text-gray-700">{{ voteResult.name }}</div>
      <div class="text-sm text-center text-gray-700 mb-4">#{{ topicid }}</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
        <DetailCard class="self-start">
          <template #header>รายละเอียด</template>
          <div class="p-2">
            {{ voteResult.description }}
          </div>
        </DetailCard>
        <div class="md:col-span-2">
          <BasicCard>
            <template #header>ผลการโหวต</template>
            <div class="p-2 overflow-auto max-h-60">
              <BasicListItem v-for="vote of choiceVoteResults" header-class="w-20">
                <template #header>{{ getPercentOf(vote).toFixed(2) }}%</template>
                {{ vote.choice }} ({{  vote.count }})
              </BasicListItem>
              <hr v-if="choiceVoteResults.length > 0" class="my-2 border-t-2" />
              <BasicListItem header-class="w-20">
                <template #header>{{ getPercentOf(novoteResult).toFixed(2) }}%</template>
                Total Votes ({{ totalVotes }})
              </BasicListItem>
            </div>
          </BasicCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-voter"]
})

const { id } = useRoute().params;
let topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${webAppName} - Vote Result #${id}`
});


const { data } = await useFetch(`/api/topic/result/${topicid}`);

const voteResult: Ref<TopicVoteCountResponse | undefined> = ref(undefined);
const votes = computed(() => voteResult.value ? voteResult.value.votes : []);

const choiceVoteResults = computed(() => {
  return votes.value.filter((ele) => ele.choice)
})
const novoteResult = computed(() => {
  return votes.value.find((ele) => !ele.choice)
})
const totalVotes = computed(() => {
  return votes.value.reduce((prev, current) => prev + current.count, 0);
})

if (!data.value) {
  showError("Topic not found or not finished");
} else {
  const { voteResult: _voteResult } =  data.value;
  voteResult.value = _voteResult;
}

function getPercentOf(vote?: TopicVoteCountRecord) {
  if(totalVotes.value <= 0 || !vote) { return 0 }
  return vote.count * 100 / totalVotes.value;
}

</script>