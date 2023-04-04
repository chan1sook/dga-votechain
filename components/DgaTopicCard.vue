<template>
  <div class="dga-topic-card" :class="[isPublicVote ? 'public' : 'private']">
    <div class="inner">
      <div v-if="isPublicVote" class="public" >Public Vote</div>
      <div v-else class="private" >Private Vote</div>
      <div class="content">
        <div class="name">{{ props.topic.name }}</div>
        <div class="time">Vote on {{ prettyStartAt }}</div>
        <div class="createdby">Create by {{ props.topic.createdByName }} (#Ticket {{ props.topic._id }})</div>
      </div>
      <div class="status">
        <button v-if="mode === 'admin' || mode === 'developer'" @click="emit('access', 'edit')">
          Edit
        </button>
        <button v-if="status === 'result'" class="result"  @click="emit('access', status)">Result</button>
        <button v-else-if="status === 'access'" class="access" @click="emit('access', status)">Access</button>
        <button v-else-if="status === 'completed'" class="completed" @click="emit('access', status)">Completed</button>
        <button v-else class="waiting" disabled @click="emit('access', status)">Waiting</button>
      </div>

      <div v-if="status === 'result'" class="duration expired">Close</div>
      <div v-else class="duration">Period: {{ prettyDuationHours }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { isTopicExpired, isTopicVoteable, isTopicVoted } from '~~/src/utils/topic';
import { perttyDurationDHM } from '~~/src/utils/datetime';

type TopicCardType = "result" | "access" | "waiting" | "completed" | "edit";
const props = defineProps<{
  topic: TopicResponseData,
  mode?: UserRole, 
}>();

const emit = defineEmits<{
  (e: 'access', v: TopicCardType) : void,
}>();

const isPublicVote = computed(() => {
  return props.topic.publicVote
})

const status = computed(() => {
  if(props.mode === 'admin' || props.mode === 'developer') {
    if(isTopicExpired(props.topic)) {
      return "result";
    } else if(isTopicVoteable(props.topic)) {
      return "access";
    } else {
      return "waiting";
    }
  } else if(props.mode === 'voter') {
    if(isTopicExpired(props.topic)) {
      return "result";
    } else if(isTopicVoted(props.topic, useSessionData().value?.digitalIdUserInfo?.citizen_id)) {
      return "completed";
    }  else if(isTopicVoteable(props.topic)) {
      return "access";
    } else {
      return "waiting";
    }
  } else {
    if(isTopicExpired(props.topic)) {
      return "result";
    } else {
      return "waiting";
    }
  }
})

const prettyDuationHours = computed(() => {
  const originalDuration = dayjs(props.topic.voteExpiredAt).diff(props.topic.voteStartAt);
  return perttyDurationDHM(originalDuration);
})

const prettyStartAt = computed(() => {
  return dayjs(props.topic.voteStartAt).format("YYYY-MM-DD HH:MM");
})

</script>

<style scoped>
.dga-topic-card {
  @apply rounded-lg shadow-lg bg-red-800 pl-6
}
.dga-topic-card.public {
  @apply bg-green-700
}

.dga-topic-card > .inner {
  @apply rounded-lg bg-white grid items-center px-4 py-4;
  grid-template-areas: "public content status" "duration content status";
  grid-template-columns: 150px auto 100px;
}

.dga-topic-card > .inner > .private {
  grid-area: public;
  @apply text-xl text-red-700;
}
.dga-topic-card > .inner > .public {
  @apply text-green-700;
}

.dga-topic-card > .inner > .content {
  grid-area: content;
  @apply flex flex-row flex-wrap gap-y-2 gap-x-4
}
.dga-topic-card > .inner > .content > .name {
  @apply w-full
}
.dga-topic-card > .inner > .content > .time
{
  @apply flex-none
}
.dga-topic-card > .inner > .status {
  grid-area: status;
  @apply flex flex-col gap-2
}
.dga-topic-card > .inner > .status > * {
  @apply rounded-full px-3 py-1 text-center text-sm text-white bg-dga-orange;
}
.dga-topic-card > .inner > .status > .completed {
  @apply bg-dga-blue;
}
.dga-topic-card > .inner > .status > .access {
  @apply bg-green-700
}
.dga-topic-card > .inner > .status > .waiting {
  @apply bg-gray-400;
}

.dga-topic-card > .inner > .duration {
  grid-area: duration;
}
.dga-topic-card > .inner > .duration.expired {
  @apply text-red-700;
}
</style>