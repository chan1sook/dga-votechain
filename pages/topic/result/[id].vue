<template>
  <div v-if="voteResult">
    <DgaHead>Vote Result</DgaHead>
    <div class="text-2xl font-bold text-center">{{ voteResult.name }}</div>
    <div class="grid grid-cols-2 gap-2 my-2">
      <div class="md:col-span-2 flex flex-row items-start gap-2 mb-4">
        <h3 class="font-bold">Ticket ID:</h3>
        <span>#{{ topicid }}</span>
      </div>
      <div class="md:col-span-2 flex flex-col gap-2 mb-12">
        <h3 class="font-bold">Description:</h3>
        <template v-if="showDescription">
          <div class="flex flex-row items-start gap-4">
            <label class="flex-none">Description</label>
            <SimpleContentFormatter :content="voteResult.description"></SimpleContentFormatter>
          </div>
          <button @click="showDescription = false" class="ml-auto">
            Hide Description
          </button>
        </template>
        <div v-else>
          <button class="inline-flex flex-row gap-2 items-center" @click="showDescription = true">
            Show Description
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <h3 class="font-bold text-xl">ผู้ชนะ</h3>
        <div v-if="winners.length > 0" class="p-2 italic text-center text-2xl">
          {{ winners.join(", ") }}
        </div>
        <div v-else class="p-2 italic text-center text-2xl">
          None
        </div>
      </div>
      <div v-if="scores" class="flex flex-col gap-2">
        <h3 class="font-bold text-xl">สถิติ</h3>
        <div class="border-2 border-dga-blue rounded-lg p-2">
          <div class="grid-3-list">
            <template v-for="score of scores">
              <div>{{ score.choice }}</div>
              <div>{{ getPercentOf(score).toFixed(2) }}%</div>
              <div>{{ score.count }}</div>
            </template>
            <hr v-if="scores.length > 0" class="my-2 border-t-2 col-span-3" />
            <div class="italic">Total</div>
            <div>{{ getPercentOf(novoteResult).toFixed(2) }}%</div>
            <div>{{ totalVotes }}</div>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col gap-2">
        <h3 class="font-bold text-xl">ตัวเลือก</h3>
        <div class="border-2 border-dga-blue rounded-lg p-2">
          <div v-for="choice of voteResult.choices.choices">
            {{ choice.name }}
          </div>
        </div>
      </div>
      <div v-if="votes" class="col-span-2 flex flex-col gap-2">
        <h3 class="font-bold text-xl">ผู้ร่วมโหวต</h3>
        <div class="border-2 border-dga-blue rounded-lg p-2">
          <div class="grid-3-list">
            <template v-for="vote of votes">
              <div>{{ formatDateTime(vote.createdAt) }}</div>
              <div>{{ vote.citizenId }}</div>
              <div>{{ vote.choice }}</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { webAppName } from "~~/src/utils/utils"
import { formatDateTime } from '~~/src/utils/datetime';

definePageMeta({
  middleware: ["auth-voter"]
})

const { id } = useRoute().params;
let topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${webAppName} - Vote Result #${id}`
});

const showDescription = ref(false);

const { data } = await useFetch(`/api/topic/result/${topicid}`);

const voteResult: Ref<TopicVoteCountResponse | undefined> = ref(undefined);
const scores = computed(() => voteResult.value ? voteResult.value.scores : null);
const winners = computed(() => voteResult.value ? voteResult.value.winners : []);
const votes = computed(() => voteResult.value ? voteResult.value.votes : null);

const novoteResult = computed(() => {
  return scores.value ? scores.value.find((ele) => !ele.choice) : undefined;
})
const totalVotes = computed(() => {
  return !scores.value ? 0 : scores.value.reduce((prev, current) => prev + current.count, 0);
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

<style scoped>
.grid-3-list {
  @apply grid gap-2;
  grid-template-columns: min-content min-content auto;
}
</style>