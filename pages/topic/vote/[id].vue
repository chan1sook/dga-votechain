<template>
  <div v-if="topic">
    <div class="relative flex flex-col md:flex-row gap-x-2 gap-y-1 justify-center items-center">
      <NuxtLink :href="localePathOf('/topics')" class="md:absolute md:left-0 text-dga-orange font-bold flex flex-row items-center">
        <ArrowLeftIcon /> {{ $t("app.modal.back") }}
      </NuxtLink>
      <div class="font-bold text-xl md:text-2xl" @click="showLocaltime = !showLocaltime">
        <div class="text-center flex flex-row justify-center items-center gap-2">{{ $t("app.voting.now") }}: {{ $d(dayjs(todayTime).toDate(), "long") }}</div>
        <div v-if="showLocaltime" class="text-center flex flex-row justify-center items-center gap-2 text-sm">{{ $t("app.voting.localtime") }}: {{ $d(dayjs(localTime).toDate(), "long") }}</div>
      </div>
    </div>
    <div class="flex flex-col md:flex-row gap-2 my-4">
      <div class="flex-1 justify-center text-base md:text-xl bg-dga-blue text-white rounded-lg flex flex-row flex-wrap md:flex-nowrap items-center gap-2 px-4 py-2 md:px-8 md:py-4">
        <template v-if="canVote">
          <div class="w-full text-center md:w-auto">{{ $t("app.voting.remainTimeVoting") }}</div>
          <div class="timer-counter"> {{ getDays(remainTime) }} </div>
          <div>{{ $t("timePeriod.day", { count: 2 }) }}</div>
          <div class="timer-counter"> {{ getHours(remainTime) }} </div>
          <div>{{ $t("timePeriod.hour", { count: 2 }) }}</div> 
          <div class="timer-counter"> {{ getMinutes(remainTime) }} </div>
          <div>{{ $t("timePeriod.minute", { count: 2 }) }}</div> 
        </template>
        <template v-else>
          <div>{{ $t("app.voting.yourVote") }}</div>
        </template>
      </div>
      <div class="w-full md:w-48 bg-dga-orange text-white rounded-lg flex flex-row md:flex-col text-center gap-2 px-4 py-2 md:px-8 md:py-4">
        <template v-if="canVote">
          <div>{{ $t("app.voting.remainVotes") }}:</div>
          <div class="ml-auto md:ml-0 md:text-xl">{{ noVoteLocked ? 0 : remainVotes || 0 }} {{ $t("app.voting.vote", { count: remainVotes || 0 }) }}</div>
        </template>
        <template v-else>
          <div>{{ $t("app.voting.totalVotes") }}:</div>
          <div class="ml-auto md:ml-0 md:text-xl">{{ totalVotes || 0 }}  {{ $t("app.voting.vote", { count: totalVotes  }) }}</div>
        </template>
      </div>
    </div>
    <h2 class="text-2xl md:text-4xl font-bold text-center my-4">
      {{ topic.name }}
    </h2>
    <template v-if="!isPaused">
      <div class="flex flex-col flex-wrap justify-center gap-2">
        <template v-for="choice of topic.choices.choices">
          <DgaButton 
            class="relative w-full max-w-md mx-auto flex flex-row gap-x-4 items-center justify-center !px-4 !rounded-3xl"
            :class="[haveImage ? 'max-w-lg': 'max-w-md']"
            :theme="getBtnThemeOfChoice(choice)"
            :color="noVoteLocked || (canVote && prevVotes.map((ele) => ele.choice).includes(choice.name)) ? 'gray2' : 'dga-blue'"
            :disabled="!canVote || noVoteLocked || prevVotes.map((ele) => ele.choice).includes(choice.name)"
            :disabled-vivid="!canVote && !noVoteLocked"
            @click="addVote(choice.name)"
          >
            <div class="w-8 sm:w-24 h-8 flex flex-row justify-center">
              <template v-if="canVote">
                <div v-if="prevVotes.map((ele) => ele.choice).includes(choice.name)" class="w-full text-gray-500 bg-gray-300 rounded-full px-4 sm:px-8 py-1 text-sm flex flex-row justify-center items-center gap-1">
                  <CheckIcon /> <span class="hidden sm:block">VOTED</span>
                </div>
                <div v-else-if="noVoteLocked" class="w-full text-gray-500 bg-gray-300 rounded-full px-4 sm:px-8 py-1 text-sm">
                  <span class="hidden sm:block">VOTE</span>
                </div>
                <div v-else-if="voteCount(choice.name) === 0" class="w-full text-white bg-dga-orange rounded-full px-4 sm:px-8 py-1 text-sm">
                  <span class="hidden sm:block">VOTE</span>
                </div>
                <div v-else class="w-full text-white bg-green-700 rounded-full px-4 sm:px-8 py-1 text-sm flex flex-row justify-center items-center gap-1">
                  <CheckIcon /> <span class="hidden sm:block">VOTED</span>
                </div>
              </template>
              <template v-else>
                <div v-if="noVoteLocked" class="w-full text-white bg-gray-500 rounded-full px-4 sm:px-8 py-1 text-sm">
                  <span class="hidden sm:block">VOTE</span>
                </div>
                <div v-else-if="votedCount(choice.name) === 0" class="w-full text-white bg-dga-orange rounded-full px-4 sm:px-8 py-1 text-sm">
                  <span class="hidden sm:block">VOTE</span>
                </div>
                <div v-else class="w-full text-white bg-green-700 rounded-full px-4 sm:px-8 py-1 text-sm flex flex-row justify-center items-center gap-1">
                  <CheckIcon /> <span class="hidden sm:block">VOTED</span>
                </div>
              </template>
            </div>
            <div class="flex-1 text-left">{{ choice.name }}</div>
            <img v-if="haveImage" :src="getImgUrlChoice(choice)" class="hidden sm:block max-h-16 w-[4rem]" @click.stop="showBigImage(choice)" />
            <div class="relative w-12">
              <template v-if="canVote">
                <div v-if="!noVoteLocked && voteCount(choice.name) > 0 && !isDistinctVotes">
                  x{{ voteCount(choice.name) }}
                </div>
              </template>
              <template v-else>
                <div v-if="votedCount(choice.name) > 0 && !isDistinctVotes">
                  x{{ votedCount(choice.name) }}
                </div>
              </template>
            </div>
          </DgaButton>
        </template>
      </div>
      <div v-if="canVote" class="text-sm flex flex-col md:flex-row justify-center gap-x-4 gap-y-2 my-4">
        <DgaButton color="dga-orange" class="mx-auto md:mx-0 w-48 md:w-auto" @click="clearVotes">
          {{ $t("app.voting.clear") }}
        </DgaButton>
        <DgaButton color="gray" class="mx-auto md:mx-0 w-48 md:w-auto" @click="lockVotes">
          {{ $t("app.voting.noVote") }}
        </DgaButton>
        <DgaButton class="mx-auto md:mx-0 w-48 md:w-auto" :disabled="(currentVotes.length === 0 && !noVoteLocked) || isPaused" @click="showConfirmModal = true">
          {{ $t("app.voting.submit") }}
        </DgaButton>
      </div>
    </template>
    <template v-else>
      <div class="text-center text-2xl">{{ $t("app.voting.paused") }}</div>
      <div v-if="getPauseCause()">
        <b>{{ $t('app.voting.pauseCause') }}:</b> {{ getPauseCause() }}
      </div>
    </template>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="submitVotes"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('app.voting.confirm') }}
    </DgaModal>
    <DgaModal :show="showImageModal" cancel-backdrop close-only @close="showImageModal = false">
      <img :src="getImgUrlChoice(selectedImageChoice)" class="max-h-[77.5vh] object-contain" />
    </DgaModal>
    <DgaLoadingModal :show="waitVote"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import CheckIcon from 'vue-material-design-icons/Check.vue';
import ArrowLeftIcon from 'vue-material-design-icons/ArrowLeft.vue';

import dayjs from "dayjs";
import { isTopicExpired } from '~/src/services/validations/topic';
import { GRAY_BASE64_IMAGE } from '~/src/services/formatter/image';

definePageMeta({
  middleware: ["vote-redirect"]
})

const i18n = useI18n()
const localePathOf = useLocalePath();

const { public: { SYNCTIME_THERSOLD } } = useRuntimeConfig();

const { id } = useRoute().params;
const topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.voting.title', "Voting")} #${topicid}`
});

const topic: Ref<TopicResponseData | undefined> = ref(undefined);
const haveImage = computed(() => {
  if(!topic.value) {
    return false;
  }
  return topic.value.choices.choices.some((ele) => !!ele.image)
})
const pauseData: Ref<TopicCtrlPauseResponseData[]> = ref([]);
const voterAllow: Ref<VoterAllowResponseData | undefined> = ref(undefined);
const noVoteLocked = ref(false);
const showConfirmModal = ref(false);
const selectedImageChoice: Ref<ChoiceData | undefined> = ref(undefined);
const showImageModal = ref(false);
const waitVote = ref(false);
const remainVotes = ref(0);
const totalVotes = ref(0);
const canVote = computed(() => {
  if(topic.value) {
    if(topic.value.publicVote && topic.value.anonymousVotes) {
      return true;
    }
    return voterAllow.value && voterAllow.value.remainVotes > 0;
  }
  return false;

});
const isDistinctVotes = computed(() => topic.value && (topic.value.multipleVotes ? topic.value.distinctVotes : true));
const allVoted = computed(() => currentVotes.value.slice().concat(prevVotes.value.map((ele) => ele.choice)))
const remainTime = ref(0);
const pauseTime = ref(0);
const isPaused = computed(() => {
  if(!topic.value) {
    return false;
  }
  return pauseData.value.some((ele) => !ele.resumeAt);
});
const todayTime = ref(Date.now());
const localTime = ref(Date.now());
const showLocaltime = ref(false);
const isSync = ref(false);
const currentVotes : Ref<ChoiceDataType[]> = ref([]);
const prevVotes: Ref<VoteResponseData[]> = ref([]);

function getBtnThemeOfChoice(choice: { name: string }) {
  const voteCounts = canVote.value ? voteCount(choice.name) : votedCount(choice.name);
  return (voteCounts > 0 && !noVoteLocked.value) ? 'default' : 'hollow2'
}

const { data } = await useFetch(`/api/topic/info/${topicid}`);

if (!data.value) {
  showError(i18n.t("app.voting.cannotVote"));
} else {
  const { topic: _topic, voterAllow: _voterAllow, pauseData: _pauseData, votes } = data.value;

  if(isTopicExpired(_topic, _pauseData, useComputedServerTime().getTime())) {
    navigateTo(`/topic/result/${_topic._id}`);
  } if(useSessionData().value.roleMode === "guest" && !(_topic.publicVote && _topic.anonymousVotes)) {
    showError({
      message: i18n.t('app.voting.error.notVoteable'),
      statusCode: 403,
    })
  } else {
    topic.value = _topic;
    prevVotes.value = votes;
    pauseData.value = _pauseData;
    voterAllow.value = _voterAllow;
    const _remainVotes = _voterAllow ? _voterAllow.remainVotes : _topic.defaultVotes;
    remainVotes.value = _remainVotes;
    totalVotes.value = _remainVotes;
    if(_remainVotes === 0 && prevVotes.value.every((ele) => ele.choice === null)) {
      noVoteLocked.value = true;
    }
  }
}

function voteCount(choice: ChoiceDataType) {
  return currentVotes.value.reduce((prev, current) => {
    if(current === choice) {
      return prev + 1;
    }
    return prev;
  }, 0)
}
function votedCount(choice: ChoiceDataType) {
  return prevVotes.value.filter((ele) => ele.choice === choice).length;
}

function getImgUrlChoice(choice: ChoiceData | undefined) {
  if(!choice ) {
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

function addVote(choice: ChoiceDataType) {
  if(!canVote.value || remainVotes.value <= 0) { return; }

  if(isDistinctVotes.value && allVoted.value.includes(choice)) {
    return
  }

  currentVotes.value.push(choice);
  remainVotes.value -= 1;
}

function clearVotes() {
  if(!canVote.value) { return; }
  noVoteLocked.value = false;
  currentVotes.value = [];
  remainVotes.value = totalVotes.value;
}

function lockVotes() {
  if(!canVote.value) { return; }
  noVoteLocked.value = true;
}

function getPauseCause() {
  let cause = "";
  const lastestPauseData = pauseData.value.find((ele) => !ele.resumeAt);
  if(lastestPauseData) {
    cause = lastestPauseData.cause;
  }

  return cause;
}

async function submitVotes() {
  if (!canVote.value || isPaused.value) { return; }

  showConfirmModal.value = false;
  waitVote.value = true;

  const votes = noVoteLocked.value ? new Array(remainVotes.value).fill(null) : currentVotes.value.slice();

  const voteFormData: VotesFormData = {
    topicid,
    votes,
  }

  await useFetch("/api/votes", {
    method: "POST",
    body: voteFormData
  });

  totalVotes.value -= votes.length;
  clearVotes();

  if(topic.value && voterAllow.value) {
    voterAllow.value.remainVotes -= votes.length;
  }

  if(topic.value && (voterAllow.value ? voterAllow.value.remainVotes === 0 : true)) {
    navigateTo(localePathOf("/topics"))
  } else {
    waitVote.value = false;
  }
}

const durationDiff = computed(() => {
  if(!topic.value) {
    return 0;
  }

  return dayjs(topic.value.voteExpiredAt).diff(useComputedServerTime());
});

function computeRemainTime() {
  if(!topic.value) {
    remainTime.value = 0;
  } else {
    if(pauseData.value.length === 0 || pauseData.value.every((ele) => ele.resumeAt)) {
      remainTime.value = dayjs(topic.value.voteExpiredAt).diff(useComputedServerTime());
    } else {
      const lastestTime = dayjs(pauseData.value[pauseData.value.length - 1].pauseAt);
      remainTime.value = dayjs(topic.value.voteExpiredAt).diff(lastestTime);
    }
  }
}

function computePauseTime() {
  if(!topic.value) {
    pauseTime.value = 0;
  } else {
    pauseTime.value = pauseData.value.reduce((prev, current) => {
      if(current.resumeAt) {
        return prev + dayjs(current.resumeAt).diff(current.pauseAt);
      }
      return prev + dayjs(useComputedServerTime()).diff(current.pauseAt);
    }, 0);
  }
}

function updateTime() {
  todayTime.value = useComputedServerTime().getTime();
  localTime.value = Date.now();
  isSync.value = useIsServerTimeSync(SYNCTIME_THERSOLD);
  
  computeRemainTime();
  computePauseTime();

  if(topic.value && !isPaused.value && durationDiff.value <= 0) {
    navigateTo(localePathOf(`/topic/result/${topic.value._id}`));
  }
}

function getDays(d: number) {
  return Math.floor(d / (24 * 60 * 60 * 1000));
}
function getHours(d: number) {
  return Math.floor(d / (60 * 60 * 1000)) -  (getDays(d) * 24);
}
function getMinutes(d: number) {
  return getTotalMinutes(d) -  ((getDays(d) * 24 + getHours(d)) * 60);
}

function getTotalMinutes(d: number) {
  return Math.floor(d / (60 * 1000));
}

const socket = useSocketIO();

socket.on("voted", (votes: VoteResponseData[]) => {
  if(topic.value) {
    for(const vote of votes) {
      if(vote.topicid !== topicid) {
        continue;
      }

      if(vote.userid && vote.userid === useSessionData().value.userid) {
        prevVotes.value.push(vote);
      }
    }
  }
});

socket.on(`pauseVote/${topicid}`, (_pauseData: TopicCtrlPauseResponseData) => {
  if(topic.value) {
    pauseData.value.push(_pauseData);
    clearVotes();
  }
});
socket.on(`resumeVote/${topicid}`, (_pauseData: TopicCtrlPauseResponseData & { voteExpiredAt: DateString }) => {
  if(topic.value) {
    pauseData.value = pauseData.value.filter((ele) => ele.resumeAt);
    pauseData.value.push({
      topicid: _pauseData.topicid,
      pauseAt: _pauseData.pauseAt,
      cause: _pauseData.cause,
      resumeAt: _pauseData.resumeAt,
    });
    
    topic.value.voteExpiredAt = _pauseData.voteExpiredAt;
  }
});

let tickerId: NodeJS.Timer | undefined;
onMounted(() => {
  tickerId = setInterval(() => {
    updateTime();
  }, 100);
  updateTime();
})

onUnmounted(() => {
  clearTimeout(tickerId);
  socket.off(`pauseVote/${topicid}`);
  socket.off(`resumeVote/${topicid}`);
});

</script>

<style scoped>
.timer-counter {
  @apply bg-white text-dga-orange text-xl md:text-2xl font-bold rounded-lg p-4;
}
</style>