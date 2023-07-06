<template>
  <div v-if="voteResult">
    <DgaHead>{{ $t('app.result.title') }}</DgaHead>
    <div class="text-2xl font-bold text-center">{{ voteResult.name }}</div>
    <div class="grid grid-cols-2 gap-2 my-2">
      <div class="col-span-2 flex flex-row items-center gap-2 mb-4 flex-wrap">
        <div class="flex-1 w-full lg:w-auto lg:flex-none flex flex-col gap-2">
          <div class="topic-type" :class="[ voteResult.type ]">
            {{ $t(`app.topicType.${voteResult.type}`, voteResult.type) }}
          </div>
          <div v-if="voteResult.createdBy">
            {{ $t('app.voting.createdBy') }} {{ formatCreatedByName(voteResult.createdBy) }}
          </div>
          <div class="flex-1 w-full lg:w-auto lg:flex-none flex flex-row gap-2 items-start">
            <h3 class="font-bold whitespace-nowrap">{{ $t('app.ticketid')}}:</h3>
            <span>#{{ topicid }}</span>
          </div>
        </div>
        <DgaButton class="w-full max-w-[200px] mx-auto lg:mr-0 whitespace-nowrap report-hide" theme="hollow" color="dga-orange" @click="exportResult">{{  $t('app.result.export') }}</DgaButton>
      </div>
    </div>  
    
    <div class="max-w-4xl mx-auto grid grid-cols-12 items-center gap-y-1 gap-x-2 mb-4">
      <h3 class="col-span-12 font-bold text-xl">{{ $t('app.result.stats')}}</h3>
      <div class="hidden sm:block sm:col-span-2 my-2"></div>
      <DgaReportBar class="col-span-10 sm:col-span-8">
        {{ $t('app.result.totalVoters')}}
        <template #percent>100.00%</template>
        <template #count>
          {{ voteResult.stats.voters.total }} {{ $t('app.countable.voter', { count: voteResult.stats.voters.total}) }}
        </template>
      </DgaReportBar>
      <div class="col-span-2 my-2"></div>
      <div class="hidden sm:block sm:col-span-2"></div>
      <DgaReportBar with-border class="col-span-10 sm:col-span-8"
        :bar-percent="getPercentOf(voteResult.stats.voters.voted, voteResult.stats.voters.total)" 
      >
        {{ $t('app.result.votedVoters')}}
        <template #percent>
          {{ getPercentOf(voteResult.stats.voters.voted, voteResult.stats.voters.total).toFixed(2) }}%
        </template>
        <template #count>
          {{ voteResult.stats.voters.voted }} {{ $t('app.countable.voter', { count: voteResult.stats.voters.voted }) }}
        </template>
      </DgaReportBar>
      <div class="col-span-2"></div>
      <div class="hidden sm:block sm:col-span-2"></div>
      <DgaReportBar with-border class="col-span-10 sm:col-span-8"
        :bar-percent="getPercentOf(absentVoters, voteResult.stats.voters.total)" 
      >
        {{ $t('app.result.noVotedVoters')}}
        <template #percent>
          {{ getPercentOf(absentVoters, voteResult.stats.voters.total).toFixed(2) }}%
        </template>
        <template #count>
          {{ absentVoters }} {{ $t('app.countable.voter', { count: absentVoters }) }}
        </template>
      </DgaReportBar>
      <div class="col-span-2"></div>
      <div class="hidden sm:block sm:col-span-2 my-2"></div>
      <DgaReportBar class="col-span-10 sm:col-span-8">
        {{ $t('app.result.totalVotes') }}
        <template #percent>100.00%</template>
        <template #count>
          {{ totalVoteStats }} {{  $t('app.countable.vote', { count: totalVoteStats }) }}
        </template>
      </DgaReportBar>
      <div class="col-span-2 my-2"></div>
      <div class="hidden sm:block sm:col-span-2"></div>
      <DgaReportBar with-border class="col-span-10 sm:col-span-8"
        :bar-percent="getPercentOf(actualVoteStats, totalVoteStats)" 
      >
        {{ $t('app.result.actualVotes') }}
        <template #percent>
          {{ getPercentOf(actualVoteStats, totalVoteStats).toFixed(2) }}%
        </template>
        <template #count>
          {{ actualVoteStats }} {{ $t('app.countable.vote', { count: actualVoteStats }) }}
        </template>
      </DgaReportBar>
      <div class="col-span-2"></div>
      <div class="hidden sm:block sm:col-span-2"></div>
      <DgaReportBar with-border class="col-span-10 sm:col-span-8"
        :bar-percent="getPercentOf(absentVotes, totalVoteStats)" 
      >
        {{ $t('app.result.remainVotes') }}
        <template #percent>
          {{ getPercentOf(absentVotes, totalVoteStats).toFixed(2) }}%
        </template>
        <template #count>
          {{ absentVotes }} {{ $t('app.countable.vote', { count: absentVotes }) }}
        </template>
      </DgaReportBar>
    </div>
    <div class="max-w-4xl mx-auto grid grid-cols-12 items-center gap-y-1 gap-x-2 mb-4">
      <h3 class="col-span-12 font-bold text-xl">{{ $t('app.result.scores')}}</h3>
      <div class="hidden sm:block sm:col-span-2"></div>
      <DgaReportBar class="col-span-10 sm:col-span-8">
        {{ $t('app.result.total')}}
        <template #percent>100.00%</template>
        <template #count>
          {{ totalVotes }} {{ $t('app.voting.vote' , { count: totalVotes })}}
        </template>
      </DgaReportBar>
      <div class="col-span-2"></div>
      <template v-for="choice of voteResult.choices.choices">
        <div class="hidden sm:block sm:col-span-2 text-right">
          <template v-if="yourVotes && yourVotes.length > 0">
            x{{ countYourVoteOf(choice.name) }} =>
          </template>
          <template v-else-if="countYourVoteOf(choice.name) > 0">
            ===>
          </template>
        </div>
        <DgaReportBar with-border class="col-span-10 sm:col-span-8"
          :bar-percent="getPercentOf(getScoreOf(choice.name).count, totalVotes)" 
        >
          <span>{{ choice.name }}</span>
          <img v-if="haveImage" :src="getImgUrlChoice(choice)" class="sm:max-h-16 w-[4rem] cursor-pointer" @click.stop="showBigImage(choice)"/> 
          <template #percent>
            {{ getPercentOf(getScoreOf(choice.name).count, totalVotes).toFixed(2) }}%
          </template>
          <template #count>
            {{ getScoreOf(choice.name)?.count || 0 }} {{ $t('app.voting.vote', { count: getScoreOf(choice.name).count })}}
          </template>
        </DgaReportBar>
        <div class="col-span-2">
          <span v-if="getRanking(choice.name)">
            #{{ getRanking(choice.name)?.rank }}
          </span>
          <span v-if="getRanking(choice.name) && getRanking(choice.name)?.rank === 1" class="ml-2">
            {{ $t('app.result.winner') }}
          </span>
        </div>
      </template>
      <template v-if="getScoreOf(null).count > 0">
        <div class="hidden sm:block sm:col-span-2 text-right mt-2">
          <template v-if="yourVotes && countYourVoteOf(null) > 0">
            x{{ countYourVoteOf(null) }} =>
          </template>
        </div>
        <DgaReportBar with-border class="col-span-10 sm:col-span-8">
          {{ $t('app.result.noVoted')}}
          <template #percent></template>
          <template #count>
            {{ getScoreOf(null).count }} {{ $t('app.voting.vote' , { count: totalVotes - getScoreOf(null).count })}}
          </template>
        </DgaReportBar>
        <div class="col-span-2 mt-2"></div>
      </template>
    </div>
    <template v-if="voters">
      <div class="max-w-4xl mx-auto grid grid-cols-12 items-center gap-y-1 gap-x-2">
        <h3 class="col-span-12 font-bold text-xl">{{ $t('app.votersList')}}</h3>
        <template v-for="voter of voters">
          <div class="hidden sm:block sm:col-span-2 my-2"></div>
          <div class="col-span-10 sm:col-span-8 relative rounded-md px-2 py-1">
            <div class="flex-1 flex flex-row gap-2 items-center">
              <div class="flex-1">{{ getPrettyFullName(voter.user) }}</div>
              <div>
                {{ voter.totalVotes }} {{  $t('app.countable.vote', { count: voter.totalVotes }) }}
              </div>
            </div>
          </div>
          <div class="col-span-2 my-2"></div>
        </template>
      </div>
    </template>
    <DgaModal :show="showImageModal" cancel-backdrop close-only @close="showImageModal = false">
      <img :src="getImgUrlChoice(selectedImageChoice)" class="max-h-[77.5vh] object-contain" />
    </DgaModal>
  </div>
</template>

<script setup lang="ts">
import { GRAY_BASE64_IMAGE } from '~/src/services/formatter/image';
import { formatCreatedByName, getPrettyFullName } from '~/src/services/formatter/user';

const i18n = useI18n();

const { id } = useRoute().params;
let topicid = Array.isArray(id) ? id[id.length - 1] : id;

const voteResult: Ref<TopicResultResponse | undefined> = ref(undefined);
const haveImage = computed(() => {
  if(!voteResult.value) {
    return false;
  }
  return voteResult.value.choices.choices.some((ele) => !!ele.image)
});
const selectedImageChoice: Ref<ChoiceData | undefined> = ref(undefined);
const showImageModal = ref(false);

const title = computed(() => {
  if(voteResult.value) {
    return `${i18n.t('appName', 'DGA E-Voting')} - ${voteResult.value.name}`
  }
  return `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.result.title')}`
})
useHead({
  title
});

const { data } = await useFetch(`/api/topic/result/${topicid}`);
if (!data.value) {
  showError("Forbidden");
} else {
  const { voteResult: _voteResult } =  data.value;
  voteResult.value = _voteResult;
}

const ranking : Ref<TopicChoiceRanking[]> = computed(() => {
  if(!voteResult.value) {
    return [];
  }
  const scores = voteResult.value.scores.filter((ele) => ele.choice);
  scores.sort((a, b) => b.count - a.count);

  return scores.map((ele, i, arr) => {
    let rank = i + 1;
    for(let j = i - 1; j >= 0; j--) {
      if(arr[j].count === ele.count) {
        rank -= 1;
      } else {
        break;
      }
    }
    return {
      choice: ele.choice,
      rank,
    }
  });
});
const voters = computed(() => voteResult.value ? voteResult.value.voters : undefined);
const yourVotes = computed(() => voteResult.value ? voteResult.value.yourVotes : null);
const absentVoters = computed(() => voteResult.value ? voteResult.value.stats.voters.total - voteResult.value.stats.voters.voted : 0);
const totalVoteStats = computed(() => voteResult.value ? voteResult.value.stats.votes.quota + voteResult.value.stats.votes.anonymous : 0);
const actualVoteStats = computed(() => voteResult.value ? voteResult.value.stats.votes.user + voteResult.value.stats.votes.anonymous : 0);
const absentVotes = computed(() => voteResult.value ? totalVoteStats.value - actualVoteStats.value : 0);

const showDescription = ref(false);

const totalVotes = computed(() => {
  if(!voteResult.value) {
    return 0;
  }

  return voteResult.value.scores.reduce((prev, current) => prev + current.count, 0);
})

function getImgUrlChoice(choice: ChoiceData | undefined) {
  if(!choice) {
    return GRAY_BASE64_IMAGE;
  }
  
  if(choice.image) {
    return `/api/image/${choice.image}`
  }
  
  return GRAY_BASE64_IMAGE;
}

function showBigImage(choice: ChoiceData) {
  selectedImageChoice.value = choice;
  showImageModal.value = true;
}

function exportResult() {
  print();
}

function getPercentOf(value: number, total: number) {
  if(total <= 0) { return 0 }
  return value * 100 / total;
}

function getScoreOf(choice: ChoiceDataType) {
  if(!voteResult.value) {
    return {
      choice,
      count: 0,
    };
  }
  
  return voteResult.value.scores.find((ele) => ele.choice === choice) || {
    choice,
    count: 0,
  };
}

function getRanking(choice: ChoiceDataType) {
  if(!ranking.value) {
    return undefined;
  }

  return ranking.value.find((ele) => ele.choice === choice)
}

function countYourVoteOf(choice: ChoiceDataType) {
  if(!yourVotes.value) {
    return 0;
  }
  return yourVotes.value.filter((ele) => ele === choice).length;
}

</script>

<style scoped>
.topic-type.private {
  @apply text-xl text-red-700;
}
.topic-type.public {
  @apply text-green-700;
}
.topic-type.internal {
  @apply text-blue-700
}
</style>

<style>
@media print {
  img {
    display: block !important;
  }
  .report-hide {
    display: none !important;
  }
}
</style>