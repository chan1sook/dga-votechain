<template>
  <div v-if="topic">
    <div class="relative flex flex-col md:flex-row gap-x-2 gap-y-1 justify-center items-center">
      <button class="md:absolute md:left-0 text-dga-orange font-bold flex flex-row items-center" @click="navigateTo(localePathOf('/topics'))">
        <MaterialIcon icon="arrow_left" /> {{ $t("voting.back") }}
      </button>
      <div v-if="!isAdminMode" class="font-bold text-xl md:text-2xl" @click="showLocaltime = !showLocaltime">
        <div class="text-center flex flex-row justify-center items-center gap-2">{{ $t("voting.now") }}: {{ $d(dayjs(todayTime).toDate(), "long") }}</div>
        <div v-if="showLocaltime" class="text-center flex flex-row justify-center items-center gap-2 text-sm">{{ $t("voting.localtime") }}: {{ $d(dayjs(localTime).toDate(), "long") }}</div>
      </div>
    </div>
    <div v-if="isAdminMode" class="flex flex-col md:flex-row gap-2 my-4">
      <div class="w-full md:w-64 bg-dga-orange text-white rounded-lg flex flex-row md:flex-col justify-center text-center gap-2 px-4 py-2 md:px-8 md:py-4">
        <div>
          {{ $t("voting.voterVoted") }}: {{ totalVotersVoted }}/{{ totalVoters }}
        </div>
        <div class="ml-auto md:ml-0 md:text-xl">
          {{ $t("voting.remainVotes") }}: {{ totalRemainVotes || 0 }} {{ $t("voting.vote", { count: totalRemainVotes || 0 }) }}
        </div>
      </div>
      <div class="flex-1 justify-center text-xl bg-dga-blue text-white rounded-lg px-4 py-2 md:px-8 md:py-4 flex flex-col gap-y-1" @click="showLocaltime = !showLocaltime" >
        <div class="text-center flex flex-row justify-center items-center gap-2">{{ $t("voting.now") }}: {{ $d(dayjs(todayTime).toDate(), "long") }}</div>
        <div v-if="showLocaltime" class="text-center flex flex-row justify-center items-center gap-2 text-sm">{{ $t("voting.localtime") }}: {{ $d(dayjs(localTime).toDate(), "long") }}</div>
      </div>
      <div class="w-full md:w-72 overflow-hidden border-2 border-dga-blue rounded-lg bg-white text-xs flex flex-row items-stretch">
        <div class="flex-1 order-2 flex flex-col gap-1 p-2 whitespace-nowrap justify-center">
          <div>{{ $t("voting.startVoteOn") }}: {{ formatDateTime(topic.voteStartAt) }}</div>
          <div>{{ $t("voting.timeRemain") }}: {{ perttyDuration(remainTime) }}</div>
          <div>{{ $t("voting.timePaused") }}: {{ perttyDuration(pauseTime) }}</div>
          <div v-if="!isPaused" class="text-green-700 text-center">
            {{ $t("voting.evoteState.running") }}
          </div>
          <div v-else class="text-red-700 text-center">
            {{ $t("voting.evoteState.paused") }}...
          </div>
        </div> 
        <button v-if="!isPaused" class="w-16 text-white bg-red-700 rounded-l-lg order-3 flex flex-col items-center justify-center px-2 py-2"
          :title="$t('voting.pause')" @click="emitPause"
        >
          <div><MaterialIcon icon="pause" class="text-4xl"></MaterialIcon></div>
          <div>{{ $t("voting.pause") }}</div>
        </button>
        <button v-else class="w-16 bg-green-700 text-white rounded-r-lg order-1 flex flex-col items-center justify-center px-2 py-2"
        :title="$t('voting.resume')" @click="emitResume"
        >
          <div><MaterialIcon icon="play_arrow" class="text-4xl"></MaterialIcon></div>
          <div>{{ $t("voting.resume") }}</div>
        </button>
      </div>
    </div>
    <div v-else class="flex flex-col md:flex-row gap-2 my-4">
      <div class="flex-1 justify-center text-base md:text-xl bg-dga-blue text-white rounded-lg flex flex-row flex-wrap md:flex-nowrap items-center gap-2 px-4 py-2 md:px-8 md:py-4">
        <template v-if="canVote">
          <div class="w-full text-center md:w-auto">{{ $t("voting.remainTimeVoting") }}</div>
          <div class="timer-counter"> {{ getDays(remainTime) }} </div>
          <div>{{ $t("timePeriod.day", { count: 2 }) }}</div>
          <div class="timer-counter"> {{ getHours(remainTime) }} </div>
          <div>{{ $t("timePeriod.hour", { count: 2 }) }}</div> 
          <div class="timer-counter"> {{ getMinutes(remainTime) }} </div>
          <div>{{ $t("timePeriod.minute", { count: 2 }) }}</div> 
        </template>
        <template v-else>
          <div>{{ $t("voting.yourVote") }}</div>
        </template>
      </div>
      <div class="w-full md:w-48 bg-dga-orange text-white rounded-lg flex flex-row md:flex-col text-center gap-2 px-4 py-2 md:px-8 md:py-4">
        <template v-if="canVote">
          <div>{{ $t("voting.remainVotes") }}:</div>
          <div class="ml-auto md:ml-0 md:text-xl">{{ noVoteLocked ? 0 : remainVotes || 0 }} {{ $t("voting.vote", { count: remainVotes || 0 }) }}</div>
        </template>
        <template v-else>
          <div>{{ $t("voting.totalVotes") }}:</div>
          <div class="ml-auto md:ml-0 md:text-xl">{{ totalVotes || 0 }}  {{ $t("voting.vote", { count: totalVotes  }) }}</div>
        </template>
      </div>
    </div>
    <h2 class="text-2xl md:text-4xl font-bold text-center my-4">
      {{ topic.name }}
    </h2>
    <template v-if="!isAdminMode">
      <template v-if="!isPaused">
        <div class="flex flex-col flex-wrap justify-center gap-2">
          <template v-for="choice of topic.choices.choices">
            <DgaButton 
              class="relative w-full max-w-md mx-auto flex flex-row gap-8 items-center justify-center !px-4"
              :theme="getBtnThemeOfChoice(choice)"
              :color="(canVote && noVoteLocked) ? 'gray' : 'dga-blue'"
              :disabled="!canVote || noVoteLocked"
              :disabled-vivid="!canVote"
              @click="addVote(choice.name)"
            >
              <div class="relative w-24">
                <template v-if="canVote">
                  <div v-if="noVoteLocked" class="text-white bg-gray-500 rounded-full px-8 py-1 text-sm">VOTE</div>
                  <div v-else-if="voteCount(choice.name) === 0" class="text-white bg-dga-orange rounded-full px-8 py-1 text-sm">VOTE</div>
                  <div v-else class="text-white bg-green-700 rounded-full pl-10 pr-6 py-1 text-sm flex flex-row items-center">
                    <MaterialIcon class="absolute left-2" icon="check" /> VOTED
                  </div>
                </template>
                <template v-else>
                  <div v-if="votedCount(choice.name) === 0" class="text-white bg-dga-orange rounded-full px-8 py-1 text-sm">VOTE</div>
                  <div v-else class="text-white bg-green-700 rounded-full pl-10 pr-6 py-1 text-sm flex flex-row items-center">
                    <MaterialIcon class="absolute left-2" icon="check" /> VOTED
                  </div>
                </template>
              </div>
              <div class="flex-1 truncate text-left">{{ choice.name }}</div>
              <div class="relative w-12">
                <template v-if="canVote">
                  <div v-if="!noVoteLocked && voteCount(choice.name) > 0 && topic.multipleVotes">
                    x{{ voteCount(choice.name) }}
                  </div>
                </template>
                <template v-else>
                  <div v-if="votedCount(choice.name) > 0 && topic.multipleVotes">
                    x{{ votedCount(choice.name) }}
                  </div>
                </template>
              </div>
            </DgaButton>
          </template>
        </div>
        <div v-if="canVote" class="text-sm flex flex-col md:flex-row justify-center gap-x-4 gap-y-2 my-4">
          <DgaButton color="dga-orange" class="mx-auto md:mx-0 w-48 md:w-auto" @click="clearVotes">
            {{ $t("voting.clear") }}
          </DgaButton>
          <DgaButton color="gray" class="mx-auto md:mx-0 w-48 md:w-auto" @click="lockVotes">
            {{ $t("voting.noVote") }}
          </DgaButton>
          <DgaButton class="mx-auto md:mx-0 w-48 md:w-auto" :disabled="(currentVotes.length === 0 && !noVoteLocked) || isPaused" @click="showConfirmModal = true">
            {{ $t("voting.submit") }}
          </DgaButton>
        </div>
      </template>
      <template v-else>
        <div class="text-center text-2xl">{{ $t("voting.evoteState.paused") }}</div>
      </template>
    </template>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="submitVotes"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('voting.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitVote"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { formatDateTime, getComputedServerTime as serverTime, perttyDuration, isServerTimeSync, getComputedServerTime } from '~~/src/utils/datetime';
import { isTopicExpired } from "~~/src/utils/topic";

definePageMeta({
  middleware: ["auth-voter"]
})

const i18n = useI18n()
const localePathOf = useLocalePath();

const { SYNCTIME_THERSOLD } = useRuntimeConfig();

const { id } = useRoute().params;
const topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${i18n.t('appName', 'Dga E-Voting')} - ${i18n.t('voting.title')} #${topicid}`
});

const topic: Ref<TopicResponseDataExtended | undefined> = ref(undefined);
const noVoteLocked = ref(false);
const showConfirmModal = ref(false);
const waitVote = ref(false);
const remainVotes = ref(0);
const totalVotes = ref(0);
const canVote = computed(() => {
  return topic.value && topic.value.voterAllow && topic.value.voterAllow.remainVotes > 0;
});
const remainTime = ref(0);
const pauseTime = ref(0);
const isPaused = computed(() => {
  if(!topic.value) {
    return false;
  }
  return topic.value.pauseData.some((ele) => !ele.resumeAt);
});
const todayTime = ref(Date.now());
const localTime = ref(Date.now());
const showLocaltime = ref(false);
const isSync = ref(false);
const roleMode = computed(() => useSessionData().value.roleMode);
const isAdminMode = computed(() => roleMode.value !== 'voter');
const currentVotes : Ref<Array<string | null>> = ref([]);
const voted: Ref<Array<VoteResponseData>> = ref([]);
const adminVoterAllows: Ref<Array<TopicVoterAllowResponseData>> = ref([]);

const totalVoters = computed(() => {
  if(topic.value) {
    return adminVoterAllows.value.length
  }
  return 0
});
const totalVotersVoted = computed(() => {
  if(topic.value) {
    return adminVoterAllows.value.filter((ele) => ele.remainVotes === 0).length;
  }
  return 0
});
const totalRemainVotes = computed(() => {
  if(topic.value) {
    return  adminVoterAllows.value.reduce((prev, current) => prev + current.remainVotes, 0);
  }
  return 0
});

function getBtnThemeOfChoice(choice: { name: string }) {
  if(canVote.value) {
    return (voteCount(choice.name) > 0 && !noVoteLocked.value) ? 'default' : 'hollow2'
  } else {
    return votedCount(choice.name) > 0 ? 'default' : 'hollow2'
  }
}

const { data } = await useFetch(`/api/topic/info/${topicid}`);

if (!data.value) {
  showError("Topic not found");
} else {
  const { topic: _topic, votes, adminVoterAllows: _adminVoterAllows } = data.value;

  if(isTopicExpired(_topic, getComputedServerTime().getTime())) {
    navigateTo(`/topic/result/${_topic._id}`);
  } else {
    topic.value = _topic;
    voted.value = votes;
    totalVotes.value = topic.value.voterAllow ? topic.value.voterAllow.totalVotes : 0;
    remainVotes.value = topic.value.voterAllow ? topic.value.voterAllow.remainVotes : 0;
    if(_adminVoterAllows) {
      adminVoterAllows.value = _adminVoterAllows;
    }
  }
}

function voteCount(choice: string | null) {
  return currentVotes.value.reduce((prev, current) => {
    if(current === choice) {
      return prev + 1;
    }
    return prev;
  }, 0)
}
function votedCount(choice: string | null) {
  return voted.value.filter((ele) => ele.choice === choice).length;
}

function addVote(choice: string | null) {
  if(!canVote.value || remainVotes.value <= 0) { return; }
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

async function submitVotes() {
  if (!canVote.value || isPaused.value) { return; }

  showConfirmModal.value = false;
  waitVote.value = true;

  const votes = noVoteLocked.value ? new Array(remainVotes.value).fill(null) : currentVotes.value.slice();
  const voteFormData: VoteFormData = {
    topicid,
    votes,
  }

  await useFetch("/api/votes", {
    method: "POST",
    body: voteFormData
  });
  
  remainVotes.value -= votes.length;
  totalVotes.value -= votes.length;
  clearVotes();

  if(remainVotes.value === 0 && roleMode.value === "voter") {
    navigateTo(localePathOf("/topics"))
  } else {
    waitVote.value = false;
  }
}

const durationDiff = computed(() => {
  if(!topic.value) {
    return 0;
  }

  return dayjs(topic.value.voteExpiredAt).diff(getComputedServerTime());
});

function computeRemainTime() {
  if(!topic.value) {
    remainTime.value = 0;
  } else {
    if(topic.value.pauseData.length === 0 || topic.value.pauseData.every((ele) => ele.resumeAt)) {
      remainTime.value = dayjs(topic.value.voteExpiredAt).diff(serverTime());
    } else {
      const lastestTime = dayjs(topic.value.pauseData[topic.value.pauseData.length - 1].pauseAt);
      remainTime.value = dayjs(topic.value.voteExpiredAt).diff(lastestTime);
    }
  }
}

function computePauseTime() {
  if(!topic.value) {
    pauseTime.value = 0;
  } else {
    pauseTime.value = topic.value.pauseData.reduce((prev, current) => {
      if(current.resumeAt) {
        return prev + dayjs(current.resumeAt).diff(current.pauseAt);
      }
      return prev + dayjs(serverTime()).diff(current.pauseAt);
    }, 0);
  }
}

function updateTime() {
  todayTime.value = serverTime().getTime();
  localTime.value = Date.now();
  isSync.value = isServerTimeSync(SYNCTIME_THERSOLD);
  
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

socket.on("voted", (votes: Array<VoteResponseData>) => {
  if(topic.value) {
    for(const vote of votes) {
      if(vote.topicid !== topicid) {
        continue;
      }

      if(vote.userid === useSessionData().value.userid) {
        voted.value.push(vote);
      }
      
      if(topic.value.voterAllow && vote.userid === topic.value.voterAllow.userid) {
        topic.value.voterAllow.remainVotes -= 1;
      }
      
      const target = adminVoterAllows.value.find((ele) => ele.userid === vote.userid);
      if(target) {
        target.remainVotes -= 1;
      }
    }
  }
});

socket.on(`pauseVote/${topicid}`, (pauseData: TopicPauseResponseData) => {
  if(topic.value) {
    topic.value.pauseData.push(pauseData);
    clearVotes();
  }
});
socket.on(`resumeVote/${topicid}`, (pauseData: TopicPauseResponseData & { voteExpiredAt: DateString }) => {
  if(topic.value) {
    topic.value.pauseData = topic.value.pauseData.filter((ele) => ele.resumeAt);
    topic.value.pauseData.push({
      topicid: pauseData.topicid,
      pauseAt: pauseData.pauseAt,
      resumeAt: pauseData.resumeAt,
    });
    
    topic.value.voteExpiredAt = pauseData.voteExpiredAt;
  }
});

function emitPause() {
  socket.volatile.emit('pauseVote', { userid: useSessionData().value.userid, topicId: topic.value?._id });
}

function emitResume() {
  socket.volatile.emit('resumeVote', { userid: useSessionData().value.userid, topicId: topic.value?._id });
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