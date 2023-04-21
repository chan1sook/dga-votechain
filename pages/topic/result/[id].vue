<template>
  <div v-if="voteResult">
    <DgaHead>{{ $t('result.title') }}</DgaHead>
    <div class="text-2xl font-bold text-center">{{ voteResult.name }}</div>
    <div class="grid grid-cols-2 gap-2 my-2">
      <div class="col-span-2 flex flex-row items-start gap-2 mb-4">
        <h3 class="font-bold">{{ $t('result.ticketid')}}:</h3>
        <span>#{{ topicid }}</span>
      </div>
      <div class="col-span-2 flex flex-col gap-2 mb-12">
        <h3 class="font-bold">{{ $t('result.description.title') }}:</h3>
        <template v-if="showDescription">
          <div class="flex flex-row items-start gap-4">
            <label class="flex-none">{{ $t('result.description.title') }}</label>
            <SimpleContentFormatter :content="voteResult.description"></SimpleContentFormatter>
          </div>
          <button :title="$t('result.description.hide')" @click="showDescription = false" class="ml-auto">
            {{ $t('result.description.hide') }}
          </button>
        </template>
        <div v-else>
          <button class="inline-flex flex-row gap-2 items-center" :title="$t('result.description.show')" @click="showDescription = true">
            {{ $t('result.description.show') }}
          </button>
        </div>
      </div>
      <div class="col-span-2 md:col-span-1 flex flex-col gap-2">
        <h3 class="font-bold text-xl">{{ $t('result.winners')}}</h3>
        <div class="border-2 border-dga-blue rounded-lg p-2">
          <table class="w-full">
            <tbody>
              <tr v-for="winner of winners"  class="transition hover:bg-slate-200" :class="[`rank-${winner.rank}`]">
                <th class="px-2 py-1" style="width: 120px">#{{ winner.rank }}</th>
                <td class="px-2 py-1" >{{ winner.choice }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="scores" class="col-span-2 md:col-span-1 flex flex-col gap-2">
        <h3 class="font-bold text-xl">{{ $t('result.stats')}}</h3>
        <div class="border-2 border-dga-blue rounded-lg p-2">
          <table class="w-full">
            <tbody>
              <tr v-for="score of scores" class="transition hover:bg-slate-200">
                <td class="px-2 py-1 text-right" style="width: 80px">{{ getPercentOf(score).toFixed(2) }}%</td>
                <th class="px-2 py-1 text-left">{{ score.choice }}</th>
                <td class="px-2 py-1 text-right" style="width: 120px">{{ score.count }}</td>
              </tr>
              <tr>
                <td colspan="3">
                  <hr class="my-2 border-t-2 col-span-3" />
                </td>
              </tr>
              <tr class="transition hover:bg-slate-200">
                <td class="px-2 py-1 text-right" style="width: 80px">{{ (noVotesCount * 100 / totalVotes).toFixed(2) }}%</td>
                <th class="px-2 py-1 text-left">{{ $t('result.noVoted')}}</th>
                <td class="px-2 py-1 text-right" style="width: 120px">{{ totalVotes - noVotesCount }}</td>
              </tr>
              <tr class="transition hover:bg-slate-200">
                <td class="px-2 py-1 text-right" style="width: 80px">100.00%</td>
                <th class="px-2 py-1 text-left">{{ $t('result.total')}}</th>
                <td class="px-2 py-1 text-right" style="width: 120px">{{ totalVotes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="votes" class="col-span-2 flex flex-col gap-2">
        <h3 class="font-bold text-xl">{{  $t('result.voteLogs') }}</h3>
        <div class="border-2 border-dga-blue rounded-lg p-2 max-h-[2000px] overflow-auto">
          <table class="w-full">
            <tbody>
              <tr v-for="vote of votes" class="transition hover:bg-slate-200">
                <td class="px-2 py-1 text-left" style="width: 200px">{{ $d(dayjs(vote.createdAt).toDate(), "short") }}</td>
                <td class="px-2 py-1 text-left">{{ getVoterName(vote.userid ) }}</td>
                <td class="px-2 py-1 text-right" style="width: 120px">{{ vote.choice }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';

definePageMeta({
  middleware: ["auth"]
})

const i18n = useI18n();

const { id } = useRoute().params;
let topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('topic.create.title')}`
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

const noVotesCount = computed(() => {
  return novoteResult.value ? novoteResult.value.count: 0;
})
const totalVotes = computed(() => {
  return !scores.value ? 0 : scores.value.reduce((prev, current) => prev + current.count, 0);
})

if (!data.value) {
  showError("Forbidden");
} else {
  const { voteResult: _voteResult } =  data.value;
  voteResult.value = _voteResult;
}

function getPercentOf(vote?: TopicVoteCountRecord) {
  if(totalVotes.value <= 0 || !vote) { return 0 }
  return vote.count * 100 / totalVotes.value;
}

function getVoterName(voter: {
  _id: string,
  firstName?: string,
  lastName?: string,
  email?: string,
}) {
  if(voter.firstName) {
    return voter.lastName ? `${voter.firstName} ${voter.lastName}` : voter.firstName;
  }
  if(voter.email) {
    return voter.email;
  }
  return voter._id
}

</script>

<style scoped>
.rank-1 {
  @apply text-2xl;
}
.rank-2 {
  @apply text-xl;
}
.rank-3 {
  @apply text-lg;
}
</style>