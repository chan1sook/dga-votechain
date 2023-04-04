<template>
  <div v-if="topic">
    <div class="relative flex flex-row justify-center items-center">
      <button class="absolute left-0 text-dga-orange font-bold flex flex-row items-center" @click="goBack">
        <MaterialIcon icon="arrow_left" /> Back
      </button>
      <div v-if="!isAdminMode" class="font-bold text-2xl">Now: {{ dayjs(todayTime).format("YYYY-MM-DD HH:mm")  }}</div>
    </div>
    <div v-if="isAdminMode" class="flex flex-row gap-2 my-4">
      <div class="w-64 bg-dga-orange text-white rounded-lg flex flex-col justify-center text-center gap-2 px-8 py-4">
        <div>Total Voter: {{ totalVotersVoted }}/{{ totalVoters }}</div>
        <div class="text-xl">Remain: {{ totalRemainVotes || 0 }} Votes</div>
      </div>
      <div class="flex-1 justify-center text-xl bg-dga-blue text-white rounded-lg flex flex-row items-center gap-2 px-8 py-4">
        Now: {{ dayjs(todayTime).format("YYYY-MM-DD HH:mm")  }}
      </div>
      <div class="w-72 overflow-hidden border-2 border-dga-blue rounded-lg bg-white text-xs flex flex-row items-stretch">
        <div class="flex-1 order-2 flex flex-col gap-1 p-2 whitespace-nowrap justify-center">
          <div>Start vote on: {{ formatDateTime(topic.voteStartAt) }}</div>
          <div>Time Remaining: {{ perttyDuration(remainTime) }}</div>
          <div>Time Paused: {{ perttyDuration(pauseTime) }}</div>
          <div v-if="!topic.votePauseAt" class="text-green-700 text-center">E-voting is Running</div>
          <div v-else class="text-red-700 text-center">E-voting is Pausing...</div>
        </div> 
        <button v-if="!topic.votePauseAt" class="w-16 text-white bg-red-700 rounded-l-lg order-3 flex flex-col items-center justify-center px-2 py-2"
          @click="emitPause"
        >
          <div><MaterialIcon icon="pause" class="text-4xl"></MaterialIcon></div>
          <div>Pause</div>
        </button>
        <button v-else class="w-16 bg-green-700 text-white rounded-r-lg order-1 flex flex-col items-center justify-center px-2 py-2"
          @click="emitResume"
        >
          <div><MaterialIcon icon="play_arrow" class="text-4xl"></MaterialIcon></div>
          <div>Voting</div>
        </button>
      </div>
    </div>
    <div v-else class="flex flex-row gap-2 my-4">
      <div class="flex-1 justify-center text-xl bg-dga-blue text-white rounded-lg flex flex-row items-center gap-2 px-8 py-4">
        <template v-if="canVote">
          <div>Time Remain for Voting</div>
          <div class="timer-counter"> {{ getDays(remainTime) }} </div>
          <div>Days</div>
          <div class="timer-counter"> {{ getHours(remainTime) }} </div>
          <div>Hours</div> 
          <div class="timer-counter"> {{ getMinutes(remainTime) }} </div>
          <div>Minutes</div> 
        </template>
        <template v-else>
          <div>Your Votes</div>
        </template>
      </div>
      <div class="w-48 bg-dga-orange text-white rounded-lg flex flex-col text-center gap-2 px-8 py-4">
          <template v-if="canVote">
          <div>Remains:</div>
          <div class="text-xl">{{ noVoteLocked ? 0 : remainVotes || 0 }} Votes</div>
        </template>
        <template v-else>
          <div>Total:</div>
          <div class="text-xl">{{ existsVotes.length || 0 }} Votes</div>
        </template>
      </div>
    </div>
    <h2 class="text-4xl font-bold text-center my-4">
      {{ topic.name }}
    </h2>
    <div class="flex flex-col flex-wrap justify-center gap-2">
      <template v-for="choice of topic.choices.choices">
        <DgaButton 
          class="relative w-full max-w-md mx-auto flex flex-row gap-2 items-center justify-center"
          :theme="getBtnThemeOfChoice(choice) ? undefined : 'hollow2'"
          :color="(canVote && noVoteLocked) ? 'gray' : 'dga-blue'"
          :disabled="!canVote || noVoteLocked"
          :disabled-vivid="!canVote"
          @click="addVote(choice.name)"
        >
          <template v-if="canVote">
            <div v-if="noVoteLocked" class="absolute left-4 text-white bg-gray-500 rounded-full px-8 py-1 text-sm">No Vote</div>
            <div v-else-if="voteCount(choice.name) === 0" class="absolute left-4 text-white bg-dga-orange rounded-full px-8 py-1 text-sm">VOTE</div>
            <div v-else class="absolute left-4 text-white bg-green-700 rounded-full pl-10 pr-6 py-1 text-sm flex flex-row items-center">
              <MaterialIcon class="absolute left-2" icon="check" /> VOTED
            </div>
          </template>
          <template v-else>
            <div v-if="votedCount(choice.name) === 0" class="absolute left-4 text-white bg-dga-orange rounded-full px-8 py-1 text-sm">VOTE</div>
            <div v-else class="absolute left-4 text-white bg-green-700 rounded-full pl-10 pr-6 py-1 text-sm flex flex-row items-center">
              <MaterialIcon class="absolute left-2" icon="check" /> VOTED
            </div>
          </template>

          <span class="truncate">{{ choice.name }}</span>

          <template v-if="canVote">
            <div v-if="!noVoteLocked && voteCount(choice.name) > 0 && totalVotes > 1" class="absolute right-4">
              x{{ voteCount(choice.name) }}
            </div>
          </template>
          <template v-else>
            <div v-if="votedCount(choice.name) > 0" class="absolute right-4">
              x{{ votedCount(choice.name) }}
            </div>
          </template>
        </DgaButton>
      </template>
    </div>
    <div v-if="canVote" class="text-sm flex flex-row justify-center gap-2 my-4">
      <DgaButton color="dga-orange" @click="clearVotes">Clear</DgaButton>
      <DgaButton color="gray" @click="lockVotes">No Vote</DgaButton>
      <DgaButton :disabled="currentVotes.length === 0 && !noVoteLocked" @click="showConfirmModal = true">Submit</DgaButton>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="submitVotes"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      ยืนยันการลงคะแนนนี้?
    </DgaModal>
    <DgaLoadingModal :show="waitVote"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { isTopicVoted } from "~~/src/utils/topic";
import { goBack, webAppName } from "~~/src/utils/utils"
import { formatDateTime, getComputedServerTime as serverTime, perttyDuration, isServerTimeSync } from '~~/src/utils/datetime';

definePageMeta({
  middleware: ["auth-voter"]
})

const { SYNCTIME_THERSOLD } = useRuntimeConfig();

const { id } = useRoute().params;
const topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${webAppName} - Vote #${topicid}`
});

const { data } = await useFetch(`/api/topic/info/${topicid}`, {
  query: { withVotes: "1" },
});

const topic: Ref<TopicResponseData | undefined> = ref(undefined);
const existsVotes: Ref<Array<VoteResponseData>> = ref([]);
const noVoteLocked = ref(false);
const showConfirmModal = ref(false);
const waitVote = ref(false);
const remainVotes = ref(0);
const totalVotes = ref(0);
const canVote = computed(() => {
  return topic.value && !isTopicVoted(topic.value, useSessionData().value?.digitalIdUserInfo?.citizen_id);
});
const remainTime = ref(0);
const pauseTime = ref(0);
const todayTime = ref(Date.now());
const isSync = ref(false);
const roleMode = computed(() => useSessionData().value.roleMode);
const isAdminMode = computed(() => roleMode.value !== 'voter');
const currentVotes : Ref<Array<string | null>> = ref([]);
const totalVoters = computed(() => {
  if(topic.value) {
    return topic.value.voterAllows.length;
  }
  return 0
});
const totalVotersVoted = computed(() => {
  if(topic.value) {
    return topic.value.voterAllows.filter((ele) => ele.remainVotes === 0).length;
  }
  return 0
});
const totalRemainVotes = computed(() => {
  if(topic.value) {
    return topic.value.voterAllows.reduce((prev, current) => prev + current.remainVotes, 0);
  }
  return 0
});

function getBtnThemeOfChoice(choice: { name: string }) {
  return (canVote.value ? (voteCount(choice.name) > 0 || noVoteLocked) : (votedCount(choice.name) > 0))
}

if (!data.value) {
  showError("Topic not found");
} else {
  const { topic: _topic, existsVotes: _existsVotes,  remainVotes: _remainVotes } = data.value;
  topic.value = _topic;
  if(_existsVotes && typeof _remainVotes !== "undefined") {
    existsVotes.value = _existsVotes;
    remainVotes.value = _remainVotes;
    totalVotes.value = _existsVotes.length + _remainVotes;
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
  return existsVotes.value.filter((ele) => ele.choice === choice).length;
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
  remainVotes.value = totalVotes.value - existsVotes.value.length;
}

function lockVotes() {
  if(!canVote.value) { return; }
  noVoteLocked.value = true;
}

async function submitVotes() {
  if (!canVote.value) { return; }

  showConfirmModal.value = false;
  waitVote.value = true;

  const votes = noVoteLocked.value ? new Array(remainVotes.value).fill(null) : currentVotes.value.slice();
  const voteFormData: VoteFormData = {
    topicid,
    votes,
  }

  const { data } = await useFetch("/api/votes", {
    method: "POST",
    body: voteFormData
  });

  if(data.value) {
    existsVotes.value.push(...data.value.votes);
  }

  remainVotes.value -= currentVotes.value.length;
  clearVotes();
  if(remainVotes.value === 0) {
    goBack();
  }
  
  waitVote.value = false;
}

function computeRemainTime() {
  if(!topic.value) {
    remainTime.value = 0;
  } else if(topic.value.votePauseAt) {
    remainTime.value = dayjs(topic.value.voteExpiredAt).diff(topic.value.votePauseAt);
  } else  {
    remainTime.value = dayjs(topic.value.voteExpiredAt).diff(serverTime());
  }
}
function computePauseTime() {
  if(!topic.value) {
    pauseTime.value = 0;
  } else if(topic.value.votePauseAt) {
    pauseTime.value = topic.value.pauseDuration + dayjs(serverTime()).diff(topic.value.votePauseAt).valueOf();
  } else  {
    pauseTime.value = topic.value.pauseDuration;
  }
}

function updateTime() {
  todayTime.value = serverTime().getTime();
  isSync.value = isServerTimeSync(SYNCTIME_THERSOLD);
  
  computeRemainTime();
  computePauseTime();
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

socket.on(`pauseVote/${topicid}`, (votePauseAt) => {
  if(topic.value) {
    topic.value.votePauseAt = votePauseAt;
  }
});
socket.on(`resumeVote/${topicid}`, ({voteExpiredAt, pauseDuration}) => {
  if(topic.value) {

    delete topic.value.votePauseAt;
    topic.value.voteExpiredAt = voteExpiredAt;
    topic.value.pauseDuration = pauseDuration;
  }
});

function emitPause() {
  socket.volatile.emit('pauseVote', { sid: useSessionData().value.sid, topicId: topic.value?._id });
}

function emitResume() {
  socket.volatile.emit('resumeVote', { sid: useSessionData().value.sid, topicId: topic.value?._id });
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
  @apply bg-white text-dga-orange text-2xl font-bold rounded-lg p-4;
}
</style>