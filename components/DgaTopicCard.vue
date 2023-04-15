<template>
  <div class="dga-topic-card" :class="[isPublicVote ? 'public' : 'private']">
    <div class="inner">
      <div v-if="isPublicVote" class="public">
        {{ $t('voting.publicVote') }}
      </div>
      <div v-else class="private" >
        {{ $t('voting.privateVote') }}
      </div>
      <div class="content">
        <div class="name">{{ props.topic.name }}</div>
        <div class="time">{{ $t('voting.voteOn') }} {{ prettyStartAt }}</div>
        <div class="createdby">{{ $t('voting.createdBy') }} {{ getCreatedByName(props.topic.createdBy) }} (#{{ props.topic._id }})</div>
      </div>
      <div class="status">
        <button v-if="props.editable" :title="$t('voting.editTopic')" @click="emit('edit')">
          {{ $t('voting.editTopic') }}
        </button>
        <button :class="[ props.status ]" :title="actualStatusStr" @click="emit('action', props.status)">
          {{ actualStatusStr }}
        </button>
      </div>

      <div v-if="status === 'result'" class="duration expired">
      {{ $t('voting.expired') }}
      </div>
      <div v-else class="duration">{{ $t('voting.period')}} : {{ prettyDuation }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';

const i18n = useI18n();

const props = withDefaults(defineProps<{
  topic: TopicResponseData,
  editable?: boolean,
  status?: TopicCardStatus,
}>(), {
  status: "access",
});

const emit = defineEmits<{
  (e: 'edit') : void,
  (e: 'action', v:TopicCardStatus) : void,
}>();

const actualStatusStr = computed(() => {
  return i18n.t(`voting.status.${props.status}`, i18n.t('voting.status.access'))
})

const isPublicVote = computed(() => {
  return props.topic.publicVote
})

const prettyDuation = computed(() => {
  const originalDuration = dayjs(props.topic.voteExpiredAt).diff(props.topic.voteStartAt);
  const days = Math.floor(originalDuration / (24 * 60 * 60 * 1000));
  if(days >= 1) {
    return `${days} ${i18n.t("timePeriod.day", {count: days})}`;
  }

  const hours = Math.floor(originalDuration / (60 * 60 * 1000));
  if(hours >= 1) {
    return `${hours} ${i18n.t("timePeriod.hour", {count: hours})}`;
  }

  const minutes = Math.floor(originalDuration / (60 * 1000));
  if(minutes >= 1) {
    return `${minutes} ${i18n.t("timePeriod.minute", {count: minutes})}`;
  }

  return i18n.t("timePeriod.nearZeroMinute")
})

const prettyStartAt = computed(() => {
  return i18n.d(dayjs(props.topic.voteStartAt).toDate(), "long");
})

function getCreatedByName(createdBy?: UserResponseFilterData) {
  if(createdBy && createdBy.firstName) {
    return createdBy.lastName ? `${createdBy.firstName} ${createdBy.lastName}` : createdBy.firstName;
  }
  return createdBy || "-";
}

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
  @apply w-full text-xl font-bold
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
.dga-topic-card > .inner > .status > .voted {
  @apply bg-dga-blue;
}
.dga-topic-card > .inner > .status > .finished {
  @apply bg-blue-700;
}
.dga-topic-card > .inner > .status > .access,
.dga-topic-card > .inner > .status > .voting  {
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