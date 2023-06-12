<template>
  <div v-if="topic">
    <div class="relative flex flex-col md:flex-row gap-x-2 gap-y-1 justify-center items-center">
      <button class="md:absolute md:left-0 text-dga-orange font-bold flex flex-row items-center" @click="navigateTo(localePathOf('/topics'))">
        <ArrowLeftIcon /> {{ $t("app.modal.back") }}
      </button>
    </div>
    <div class="flex flex-col md:flex-row gap-2 my-4">
      <div class="w-full md:w-64 bg-dga-orange text-white rounded-lg flex flex-row md:flex-col justify-center text-center gap-2 px-4 py-2 md:px-8 md:py-4">
        <div>
          {{ $t("app.voting.voterVoted") }}: {{ totalVotersVoted }}/{{ totalVoters }}
        </div>
        <div class="ml-auto md:ml-0 md:text-xl">
          {{ $t("app.voting.remainVotes") }}: {{ totalRemainVotes || 0 }} {{ $t("app.voting.vote", { count: totalRemainVotes || 0 }) }}
        </div>
      </div>
      <div class="flex-1 justify-center text-xl bg-dga-blue text-white rounded-lg px-4 py-2 md:px-8 md:py-4 flex flex-col gap-y-1" @click="showLocaltime = !showLocaltime" >
        <div class="text-center flex flex-row justify-center items-center gap-2">{{ $t("app.voting.now") }}: {{ $d(dayjs(todayTime).toDate(), "long") }}</div>
        <div v-if="showLocaltime" class="text-center flex flex-row justify-center items-center gap-2 text-sm">{{ $t("app.voting.localtime") }}: {{ $d(dayjs(localTime).toDate(), "long") }}</div>
      </div>
      <div class="w-full md:w-72 overflow-hidden border-2 border-dga-blue rounded-lg bg-white text-xs flex flex-row items-stretch">
        <div class="flex-1 order-2 flex flex-col gap-1 p-2 whitespace-nowrap justify-center">
          <div>{{ $t("app.voting.startVoteOn") }}: {{ formatDateTime(topic.voteStartAt) }}</div>
          <div>{{ $t("app.voting.timeRemain") }}: {{ perttyDuration(remainTime) }}</div>
          <div>{{ $t("app.voting.timePaused") }}: {{ perttyDuration(pauseTime) }}</div>
          <div v-if="!isPaused" class="text-green-700 text-center">
            {{ $t("app.voting.running") }}
          </div>
          <div v-else class="text-red-700 text-center">
            {{ $t("app.voting.paused") }}...
          </div>
        </div> 
        <button v-if="!isPaused" class="w-16 text-white bg-red-700 rounded-l-lg order-3 flex flex-col items-center justify-center px-2 py-2"
          :title="$t('app.voting.pause')" @click="popupPauseModal"
        >
          <div><PauseIcon :size="28" /></div>
          <div>{{ $t("app.voting.pause") }}</div>
        </button>
        <button v-else class="w-16 bg-green-700 text-white rounded-r-lg order-1 flex flex-col items-center justify-center px-2 py-2"
        :title="$t('app.voting.resume')" @click="emitResume"
        >
          <div><PlayIcon :size="28" /></div>
          <div>{{ $t("app.voting.resume") }}</div>
        </button>
      </div>
    </div>
    <h2 class="text-2xl md:text-4xl font-bold text-center my-4">
      {{ topic.name }}
    </h2>
    <div class="mx-auto max-w-2xl">
      <div class="font-bold text-xl mb-2">{{ $t('app.votersList') }}</div>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12 font-bold">
          {{ $t('app.userName')}}
        </div>
        <template v-for="voter of voterAllowList">
          <div class="col-span-12">
            {{ getPrettyFullName(voter) }}
          </div>
        </template>
      </div>
    </div>
    <DgaModal :show="showConfirmModal"
      @confirm="emitPause"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      <div>{{ $t('app.voting.pauseCauseTitle') }}</div>
      <DgaInput v-model="pauseCause" :placeholder="$t('app.voting.pauseCause')" />
    </DgaModal>
    <DgaLoadingModal :show="waitPause"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import ArrowLeftIcon from 'vue-material-design-icons/ArrowLeft.vue';
import PauseIcon from 'vue-material-design-icons/Pause.vue';
import PlayIcon from 'vue-material-design-icons/Play.vue';

import dayjs from "dayjs";
import { formatDateTime, perttyDuration } from '~/src/services/formatter/datetime';
import { isTopicExpired } from '~/src/services/validations/topic';
import { getPrettyFullName } from '~/src/services/formatter/user';

definePageMeta({
  middleware: ["vote-redirect", "auth-admin"]
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
const pauseData: Ref<TopicCtrlPauseResponseData[]> = ref([]);
const showConfirmModal = ref(false);
const waitPause = ref(false);
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
const voterAllowList: Ref<VoterAllowVoteData[]> = ref([]);
const rawVoterAllows: Ref<RawVoterAllowVoteData[]> = ref([]);
const totalVoters = computed(() => {
  if(topic.value) {
    return voterAllowList.value.length
  }
  return 0
});
const totalVotersVoted = computed(() => {
  if(topic.value) {
    return rawVoterAllows.value.filter((ele) => ele.remainVotes === 0).length;
  }
  return 0
});
const totalRemainVotes = computed(() => {
  if(topic.value) {
    return  rawVoterAllows.value.reduce((prev, current) => prev + current.remainVotes, 0);
  }
  return 0
});
const pauseCause = ref("");

const { data } = await useFetch(`/api/topic/info-admin/${topicid}`);

if (!data.value) {
  showError(i18n.t("voting.cannotVote"));
} else {
  const { topic: _topic, voterAllows: _voteAllows, pauseData: _pauseData, rawVoterAllows: _rawVoterAllows } = data.value;

  if(isTopicExpired(_topic, _pauseData, useComputedServerTime().getTime())) {
    navigateTo(`/topic/result/${_topic._id}`);
  } else {
    topic.value = _topic;
    pauseData.value = _pauseData;
    voterAllowList.value = _voteAllows;
    rawVoterAllows.value = _rawVoterAllows;
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
  isSync.value = useIsServerTimeSync(SYNCTIME_THERSOLD).value;
  
  computeRemainTime();
  computePauseTime();

  if(topic.value && !isPaused.value && durationDiff.value <= 0) {
    navigateTo(localePathOf(`/topic/result/${topic.value._id}`));
  }
}

const socket = useSocketIO();

socket.on("voted", (votes: VoteResponseData[]) => {
  if(topic.value) {
    for(const vote of votes) {
      if(vote.topicid !== topicid) {
        continue;
      }
      
      const target = rawVoterAllows.value.find((ele) => ele._id === vote._id);
      if(target && target.remainVotes > 0) {
        target.remainVotes -= 1;
      }
    }
  }
});

socket.on(`pauseVote/${topicid}`, (_pauseData: TopicCtrlPauseResponseData) => {
  if(topic.value) {
    pauseData.value.push(_pauseData);
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

function popupPauseModal() {
  pauseCause.value = "";
  showConfirmModal.value = true;
}

function emitPause() {
  if(!topic.value) {
    return;
  }

  showConfirmModal.value = false;
  waitPause.value = true;
  socket.volatile.emit('pauseVote', {
    userid: useSessionData().value.userid,
    topicid: topic.value._id,
    cause: pauseCause.value
  });
  waitPause.value = false;
}

function emitResume() {
  if(!topic.value) {
    return;
  }

  waitPause.value = true;
  socket.volatile.emit('resumeVote', {
    userid: useSessionData().value.userid,
    topicid: topic.value._id
  });
  waitPause.value = false;
}

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