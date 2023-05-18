<template>
  <div v-if="voteResult">
    <DgaHead>{{ $t('result.title') }}</DgaHead>
    <div class="text-2xl font-bold text-center">{{ voteResult.name }}</div>
    <div class="grid grid-cols-2 gap-2 my-2">
      <div class="col-span-2 flex flex-row items-center gap-2 mb-4 flex-wrap">
        <div class="flex-1 w-full lg:w-auto lg:flex-none flex flex-row gap-2 items-start">
          <h3 class="font-bold whitespace-nowrap">{{ $t('result.ticketid')}}:</h3>
          <span>#{{ topicid }}</span>
        </div>
        <DgaButton class="w-full max-w-[200px] mx-auto lg:mr-0 whitespace-nowrap" theme="hollow" color="dga-orange" @click="exportResult">{{  $t('result.export') }}</DgaButton>
      </div>
      <div class="col-span-2 flex flex-col gap-2 mb-4">
        <template v-if="showDescription">
          <h3 class="font-bold">{{ $t('result.description.title') }}:</h3>
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
    
    <div class="max-w-4xl mx-auto grid grid-cols-12 items-center gap-y-1 gap-x-2">
      <h3 class="col-span-12 font-bold text-xl">{{ $t('result.stats')}}</h3>
      <div class="hidden sm:block sm:col-span-2"></div>
      <div class="col-span-10 sm:col-span-8 flex flex-row gap-2 px-2 py-1 mb-4">
        <div class="flex-1 flex flex-row gap-2 items-center">
          <div class="flex-1">{{ $t('result.total')}}</div>
          <div>100.00% |</div>
          <div>
            <abbr :title="$t('result.notIncludeNoVote')">{{ totalVotes }}  {{ $t('voting.vote' , { count: totalVotes })}}*</abbr>
          </div>
        </div>
      </div>
      <div class="col-span-2"></div>
      <template v-for="choice of voteResult.choices.choices">
        <div class="hidden sm:block sm:col-span-2 text-right">
          <template v-if="yourVotes && yourVotes.length > 0">
            x{{ yourVoteCount(choice.name) }} =>
          </template>
          <template v-else-if="yourVoteCount(choice.name) > 0">
            ===>
          </template>
        </div>
        <div class="col-span-10 sm:col-span-8 relative rounded-md border-2 border-dga-blue">
          <div class="flex flex-row gap-2 px-2 py-1">
            <div class="flex-1 flex flex-row items-center gap-2">
              <div class="flex-1">{{ choice.name }}</div>
              <template v-if="getScore(choice.name)">
                <div>{{ getPercentOfOptIn(getScore(choice.name)).toFixed(2) }}% |</div>
                <div>
                  {{ getScore(choice.name)?.count }} {{ $t('voting.vote' , { count: getScore(choice.name).count })}}
                </div>
              </template>
            </div>
          </div>
          <div v-if="scores" class="absolute left-0 top-0 bottom-0 bg-dga-blue opacity-25"
            :style="{ width: getPercentOfOptIn(getScore(choice.name)).toFixed(2) + '%'}"
          ></div>
        </div>
        <div class="col-span-2">
          <span v-if="getWinner(choice.name)">
            #{{ getWinner(choice.name)?.rank }}
          </span>
          <span v-if="getWinner(choice.name) && getWinner(choice.name)?.rank === 1" class="ml-2">
            {{ $t('result.winner') }}
          </span>
        </div>
      </template>
      <template v-if="getScore(null).count > 0">
        <div class="hidden sm:block sm:col-span-2 text-right mt-4">
          <template v-if="yourVotes && yourVoteCount(null) > 0">
            x{{ yourVoteCount(null) }} =>
          </template>
        </div>
        <div class="col-span-10 sm:col-span-8 relative mt-4 border-2 rounded-md border-dga-blue">
          <div class="flex flex-row gap-2 px-2 py-1 ">
            <div class="flex-1 flex flex-row gap-2 items-center">
              <div class="flex-1">{{ $t('result.noVoted')}}</div>
              <template v-if="scores">
                <div>{{ getPercentOf(getScore(null)).toFixed(2) }}% |</div>
                <div>
                  {{ getScore(null).count }} {{ $t('voting.vote' , { count: totalVotes - getScore(null).count })}}
                </div>
              </template>
            </div>
            <div v-if="scores" class="absolute z-[-1] left-0 top-0 bottom-0 bg-dga-blue opacity-25"
              :style="{ width: (getScore(null).count * 100 / totalVotes).toFixed(2) + '%'}">
            </div>
          </div>
        </div>
        <div class="col-span-2 mt-4"></div>
      </template>
      
    </div>

    <template v-if="votes">
      <div v-if="!showVotingLog" class="mt-4 text-center">
        <DgaButton color="dga-orange" @click="showVotingLog = true">{{  $t('result.showVoteLogs') }}</DgaButton>
      </div>
      <div v-else class="col-span-2 flex flex-col mt-4 gap-2">
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
    </template>
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
  if(!scores.value) {
    return { choice: null, count: 0 };
  }

  const target = scores.value.find((ele) => !ele.choice);
  return target || { choice: null, count: 0 };
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

function getPercentOf(vote?: TopicVoteCountRecord) {
  if(totalVotes.value <= 0 || !vote) { return 0 }
  return vote.count * 100 / totalVotes.value;
}

function getPercentOfOptIn(vote?: TopicVoteCountRecord) {
  if(totalVotesnotNoVote.value <= 0 || !vote) { return 0 }
  return vote.count * 100 / totalVotesnotNoVote.value;
}

function getScore(choice: string | null) {
  if(!scores.value) {
    return {
      choice,
      count: 0,
    };
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