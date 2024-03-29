<template>
  <div v-if="topic">
    <div
      class="relative flex flex-col items-center justify-center gap-x-2 gap-y-1 md:flex-row"
    >
      <button
        class="flex flex-row items-center font-bold text-dga-orange md:absolute md:left-0"
        @click="navigateTo(localePathOf('/topics'))"
      >
        <ArrowLeftIcon /> {{ $t("app.modal.back") }}
      </button>
    </div>
    <div class="my-4 flex flex-col gap-2 md:flex-row">
      <div
        class="flex w-full flex-row justify-center gap-2 rounded-lg bg-dga-orange px-4 py-2 text-center text-white md:w-64 md:flex-col md:px-8 md:py-4"
      >
        <div>
          {{ $t("app.voting.voterVoted") }}:
          <template v-if="totalVoters > 0">
            {{ totalVotersVoted }}/{{ totalVoters }}
            <span v-if="anonVotes.length > 0">+{{ anonVotes.length }}</span>
          </template>
          <template v-else>{{ anonVotes.length }}</template>
        </div>
        <div v-if="totalVoters > 0" class="ml-auto md:ml-0 md:text-xl">
          {{ $t("app.voting.remainVotes") }}: {{ totalRemainVotes || 0 }}
          {{ $t("app.voting.vote", { count: totalRemainVotes || 0 }) }}
        </div>
      </div>
      <div
        class="flex flex-1 flex-col justify-center gap-y-1 rounded-lg bg-dga-blue px-4 py-2 text-xl text-white md:px-8 md:py-4"
        @click="showLocaltime = !showLocaltime"
      >
        <div
          class="flex flex-row items-center justify-center gap-2 text-center"
        >
          {{ $t("app.voting.now") }}:
          {{ $d(dayjs(todayTime).toDate(), "long") }}
        </div>
        <div
          v-if="showLocaltime"
          class="flex flex-row items-center justify-center gap-2 text-center text-sm"
        >
          {{ $t("app.voting.localtime") }}:
          {{ $d(dayjs(localTime).toDate(), "long") }}
        </div>
      </div>
      <div
        class="flex w-full flex-row items-stretch overflow-hidden rounded-lg border-2 border-dga-blue bg-white text-xs md:w-72"
      >
        <div
          class="order-2 flex flex-1 flex-col justify-center gap-1 whitespace-nowrap p-2"
        >
          <div>
            {{ $t("app.voting.startVoteOn") }}:
            {{ formatDateTime(topic.voteStartAt) }}
          </div>
          <div>
            {{ $t("app.voting.timeRemain") }}: {{ perttyDuration(remainTime) }}
          </div>
          <div>
            {{ $t("app.voting.timePaused") }}: {{ perttyDuration(pauseTime) }}
          </div>
          <div v-if="!isPaused" class="text-center text-green-700">
            {{ $t("app.voting.running") }}
          </div>
          <div v-else class="text-center text-red-700">
            {{ $t("app.voting.paused") }}...
          </div>
        </div>
        <button
          v-if="!isPaused"
          class="order-3 flex w-16 flex-col items-center justify-center rounded-l-lg bg-red-700 px-2 py-2 text-white"
          :title="$t('app.voting.pause')"
          @click="popupPauseModal"
        >
          <div><PauseIcon :size="28" /></div>
          <div>{{ $t("app.voting.pause") }}</div>
        </button>
        <button
          v-else
          class="order-1 flex w-16 flex-col items-center justify-center rounded-r-lg bg-green-700 px-2 py-2 text-white"
          :title="$t('app.voting.resume')"
          @click="emitResume"
        >
          <div><PlayIcon :size="28" /></div>
          <div>{{ $t("app.voting.resume") }}</div>
        </button>
      </div>
    </div>
    <h2 class="my-4 text-center text-2xl font-bold md:text-4xl">
      {{ topic.name }}
    </h2>
    <div class="mx-auto max-w-2xl">
      <div class="mb-2 text-xl font-bold">{{ $t("app.votersList") }}</div>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12 font-bold">
          {{ $t("app.userName") }}
        </div>
        <template v-for="voter of voterAllowList">
          <div class="col-span-12">
            {{ getPrettyFullName(voter) }}
          </div>
        </template>
        <template v-if="voterAllowList.length === 0">
          <div class="col-span-12">-</div>
        </template>
      </div>
    </div>
    <DgaModal
      :show="showConfirmModal"
      @confirm="emitPause"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      <div>{{ $t("app.voting.pauseCauseTitle") }}</div>
      <DgaInput
        v-model="pauseCause"
        :placeholder="$t('app.voting.pauseCause')"
      />
    </DgaModal>
    <DgaLoadingModal :show="waitPause"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import ArrowLeftIcon from "vue-material-design-icons/ArrowLeft.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import PlayIcon from "vue-material-design-icons/Play.vue";

import dayjs from "dayjs";
import {
  formatDateTime,
  perttyDuration,
} from "~/src/services/formatter/datetime";
import {
  isTopicExpired,
  isTopicReadyToVote,
} from "~/src/services/validations/topic";
import { getPrettyFullName } from "~/src/services/formatter/user";

definePageMeta({
  middleware: ["vote-redirect", "auth-admin"],
});

const i18n = useI18n();
const localePathOf = useLocalePath();

const {
  public: { SYNCTIME_THERSOLD },
} = useRuntimeConfig();

const { id } = useRoute().params;
const topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.voting.title",
    "Voting"
  )} #${topicid}`,
});

const topic: Ref<TopicResponseData | undefined> = ref(undefined);
const pauseData: Ref<TopicCtrlPauseResponseData[]> = ref([]);
const anonVotes: Ref<AnonymousVoteResponseData[]> = ref([]);
const showConfirmModal = ref(false);
const waitPause = ref(false);
const remainTime = ref(0);
const pauseTime = ref(0);
const isPaused = computed(() => {
  if (!topic.value) {
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
  if (topic.value) {
    return voterAllowList.value.length;
  }
  return 0;
});
const totalVotersVoted = computed(() => {
  if (topic.value) {
    return rawVoterAllows.value.filter((ele) => ele.remainVotes === 0).length;
  }
  return 0;
});
const totalRemainVotes = computed(() => {
  if (topic.value) {
    return rawVoterAllows.value.reduce(
      (prev, current) => prev + current.remainVotes,
      0
    );
  }
  return 0;
});
const pauseCause = ref("");

const { data } = await useFetch(`/api/topic/info-admin/${topicid}`);

if (!data.value) {
  showError(i18n.t("app.voting.cannotCtrlVote"));
} else {
  const {
    topic: _topic,
    voterAllows: _voteAllows,
    pauseData: _pauseData,
    rawVoterAllows: _rawVoterAllows,
    anonyomusVotes: _anonVoteGroups,
  } = data.value;

  if (!isTopicReadyToVote(_topic, useComputedServerTime().getTime())) {
    showError({
      message: i18n.t("app.voting.error.waiting"),
      statusCode: 403,
    });
  } else if (
    isTopicExpired(_topic, _pauseData, useComputedServerTime().getTime())
  ) {
    navigateTo(`/topic/result/${_topic._id}`);
  } else {
    topic.value = _topic;
    pauseData.value = _pauseData;
    voterAllowList.value = _voteAllows;
    rawVoterAllows.value = _rawVoterAllows;
    anonVotes.value = _anonVoteGroups;
  }
}

function computeRemainTime() {
  if (!topic.value) {
    remainTime.value = 0;
  } else {
    if (
      pauseData.value.length === 0 ||
      pauseData.value.every((ele) => ele.resumeAt)
    ) {
      remainTime.value = dayjs(topic.value.voteExpiredAt).diff(
        useComputedServerTime()
      );
    } else {
      const lastestTime = dayjs(
        pauseData.value[pauseData.value.length - 1].pauseAt
      );
      remainTime.value = dayjs(topic.value.voteExpiredAt).diff(lastestTime);
    }
  }
}

function computePauseTime() {
  if (!topic.value) {
    pauseTime.value = 0;
  } else {
    pauseTime.value = pauseData.value.reduce((prev, current) => {
      if (current.resumeAt) {
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

  if (topic.value && !isPaused.value && remainTime.value <= 0) {
    navigateTo(localePathOf(`/topic/result/${topic.value._id}`));
  }
}

const socket = useSocketIO();

socket.on("voted", (votes: VoteResponseData[]) => {
  if (topic.value) {
    for (const vote of votes) {
      if (vote.topicid !== topicid) {
        continue;
      }

      const target = rawVoterAllows.value.find((ele) => ele._id === vote._id);
      if (target && target.remainVotes > 0) {
        target.remainVotes -= 1;
      }

      if (!target) {
        const anonVoteTarget = anonVotes.value.find(
          (ele) => ele.groupid === vote.groupid
        );
        if (anonVoteTarget) {
          anonVoteTarget.count += 1;
        } else {
          anonVotes.value.push({ groupid: vote.groupid, count: 1 });
        }
      }
    }
  }
});

socket.on(`pauseVote/${topicid}`, (_pauseData: TopicCtrlPauseResponseData) => {
  if (topic.value) {
    pauseData.value.push(_pauseData);
  }
});
socket.on(
  `resumeVote/${topicid}`,
  (_pauseData: TopicCtrlPauseResponseData & { voteExpiredAt: DateString }) => {
    if (topic.value) {
      pauseData.value = pauseData.value.filter((ele) => ele.resumeAt);
      pauseData.value.push({
        topicid: _pauseData.topicid,
        pauseAt: _pauseData.pauseAt,
        cause: _pauseData.cause,
        resumeAt: _pauseData.resumeAt,
      });

      topic.value.voteExpiredAt = _pauseData.voteExpiredAt;
    }
  }
);

function popupPauseModal() {
  pauseCause.value = "";
  showConfirmModal.value = true;
}

function emitPause() {
  if (!topic.value) {
    return;
  }

  showConfirmModal.value = false;
  waitPause.value = true;
  socket.volatile.emit("pauseVote", {
    userid: useSessionData().value.userid,
    topicid: topic.value._id,
    cause: pauseCause.value,
  });
  waitPause.value = false;
}

function emitResume() {
  if (!topic.value) {
    return;
  }

  waitPause.value = true;
  socket.volatile.emit("resumeVote", {
    userid: useSessionData().value.userid,
    topicid: topic.value._id,
  });
  waitPause.value = false;
}

let tickerId: NodeJS.Timer | undefined;
onMounted(() => {
  tickerId = setInterval(() => {
    updateTime();
  }, 100);
  updateTime();
});

onUnmounted(() => {
  clearTimeout(tickerId);
  socket.off(`pauseVote/${topicid}`);
  socket.off(`resumeVote/${topicid}`);
});
</script>

<style scoped>
.timer-counter {
  @apply rounded-lg bg-white p-4 text-xl font-bold text-dga-orange md:text-2xl;
}
</style>
