<template>
  <div v-if="voteResult">
    <DgaHead>{{ $t('result.title') }}</DgaHead>
    <div class="text-2xl font-bold text-center">{{ voteResult.name }}</div>
    <div class="grid grid-cols-2 gap-2 my-2">
      <div class="col-span-2 flex flex-row items-center gap-2 mb-4 flex-wrap">
        <div class="flex flex-row gap-2 items-start">
          <h3 class="font-bold">{{ $t('result.ticketid')}}:</h3>
          <span>#{{ topicid }}</span>
        </div>
        <DgaButton class="ml-auto" theme="hollow" color="dga-orange" @click="exportResult">Export Result</DgaButton>
      </div>
      <div class="col-span-2 flex flex-col gap-2 mb-4">
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
    </div>
    <div class="my-2 max-w-4xl mx-auto">
      <h3 class="font-bold text-xl">{{ $t('result.stats')}}</h3>
      <div class="flex flex-row gap-2">
        <div v-if="yourVotes && yourVotes.length > 0">
          <div class="px-2 py-1 my-1 h-[2rem] mb-4"></div>
          <div v-for="choice of voteResult.choices.choices" class="px-2 py-1 my-1 h-[2rem]">
            <template v-if="yourVotes.length > 0">
              {{ $t('result.yourChoice') }} (x{{ yourVoteCount(choice.name) }}) ===>
            </template>
            <template v-else-if="yourVoteCount(choice.name) > 0">
              {{ $t('result.yourChoice') }} ===>
            </template>
          </div>
          <div class="px-2 py-1 my-1 h-[2rem] mt-4">
            <template v-if="!yourVotes || yourVotes.length === 0 || yourVoteCount(null) === yourVotes.length">
              {{ $t('result.yourChoice') }} ===>
            </template>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex flex-row gap-2 px-2 py-1 my-1 mb-4">
            <div class="flex-1 flex flex-row gap-2">
              <div class="flex-1">{{ $t('result.total')}}</div>
              <div>100.00% |</div>
            </div>
            <div>
              <abbr :title="$t('result.notIncludeNoVote')">{{ totalVotes }}  {{ $t('voting.vote' , { count: totalVotes })}}*</abbr>
            </div>
          </div>
          <div v-for="choice of voteResult.choices.choices" class="relative flex flex-row gap-2 border-2 px-2 py-1 my-1 rounded-md border-dga-blue">
            <div class="flex-1 flex flex-row gap-2">
              <div class="flex-1">{{ choice.name }}</div>
              <div v-if="getScore(choice.name)">
                {{ getPercentOfOptIn(getScore(choice.name)).toFixed(2) }}% |
              </div>
            </div>
            <div v-if="getScore(choice.name)">
              {{ getScore(choice.name)?.count }} {{ $t('voting.vote' , { count: getScore(choice.name)?.count })}}
            </div>
            <div v-if="getScore(choice.name)" class="absolute left-0 top-0 bottom-0 bg-dga-blue/25"
              :style="{ width: getPercentOfOptIn(getScore(choice.name)).toFixed(2) + '%'}"
            ></div>
          </div>
          <div class="relative flex flex-row gap-2 border-2 px-2 py-1 my-1 mt-4 rounded-md border-dga-blue">
            <div class="flex-1 flex flex-row gap-2">
              <div class="flex-1">{{ $t('result.noVoted')}}</div>
              <div v-if="scores">{{ (noVotesCount * 100 / totalVotes).toFixed(2) }}% |</div>
            </div>
            <div v-if="scores">
              {{ totalVotes - noVotesCount }} {{ $t('voting.vote' , { count: totalVotes - noVotesCount  })}}
            </div>
            <div  v-if="scores" class="absolute left-0 top-0 bottom-0 bg-dga-blue/25"
              :style="{ width: (noVotesCount * 100 / totalVotes).toFixed(2) + '%'}">
            </div>
          </div>
        </div>
        <div>
          <div class="px-2 py-1 my-1 mb-4 h-[2rem]"></div>
          <div v-for="choice of voteResult.choices.choices" class="px-2 py-1 my-1 h-[2rem] flex flex-row gap-2">
            <span v-if="getWinner(choice.name)">
              #{{ getWinner(choice.name)?.rank }}
            </span>
            <span v-if="getWinner(choice.name) && getWinner(choice.name)?.rank === 1">
              {{ $t('result.winner') }}
            </span>
          </div>
          <div class="px-2 py-1 my-1 h-[2rem] mt-4"></div>
        </div>
      </div>
    </div>
    <div v-if="votes" class="gap-2 my-2">
      <DgaButton color="dga-orange" @click="showVotingLog = true">Show Voting Log</DgaButton>
    </div>
    
    <div v-if="votes && showVotingLog" class="col-span-2 flex flex-col gap-2">
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
  title: `${i18n.t('appName', 'Dga E-Voting')} - ${i18n.t('topic.create.title')}`
});

const showDescription = ref(false);

const { data } = await useFetch(`/api/topic/result/${topicid}`);

const voteResult: Ref<TopicVoteCountResponse | undefined> = ref(undefined);
const scores = computed(() => voteResult.value ? voteResult.value.scores : null);
const winners = computed(() => voteResult.value ? voteResult.value.winners : []);
const votes = computed(() => voteResult.value ? voteResult.value.votes : null);
const yourVotes = computed(() => voteResult.value ? voteResult.value.yourVotes : null);

const showVotingLog = ref(false);

const novoteResult = computed(() => {
  return scores.value ? scores.value.find((ele) => !ele.choice) : undefined;
})

const noVotesCount = computed(() => {
  return novoteResult.value ? novoteResult.value.count: 0;
})
const totalVotes = computed(() => {
  return !scores.value ? 0 : scores.value.reduce((prev, current) => prev + current.count, 0);
})
const totalVotesnotNoVote = computed(() => {
  return totalVotes.value - noVotesCount.value;
})

if (!data.value) {
  showError("Forbidden");
} else {
  const { voteResult: _voteResult } =  data.value;
  voteResult.value = _voteResult;
}

function exportResult() {
  print();
}

function getPercentOfOptIn(vote?: TopicVoteCountRecord) {
  if(totalVotesnotNoVote.value <= 0 || !vote) { return 0 }
  return vote.count * 100 / totalVotesnotNoVote.value;
}

function getScore(choice: string | null) {
  if(!scores.value) {
    return undefined;
  }
  
  return scores.value.find((ele) => ele.choice === choice) || {
    choice,
    count: 0,
  };
}

function getWinner(choice: string | null) {
  if(!winners.value) {
    return undefined;
  }

  return winners.value.find((ele) => ele.choice === choice)
}
function yourVoteCount(choice: string | null) {
  if(!yourVotes.value) {
    return 0;
  }
  return yourVotes.value.filter((ele) => ele.choice === choice).length;
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