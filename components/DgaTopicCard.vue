<template>
  <div class="dga-topic-card" :class="[isPublicVote ? 'public' : 'private']">
    <div class="inner">
      <div v-if="isPublicVote" class="public">
        {{ $t('app.publicVote') }}
      </div>
      <div v-else class="private" >
        {{ $t('app.privateVote') }}
      </div>
      <div class="content">
        <div class="name">{{ props.topic.name }}</div>
        <div class="time">{{ $t('app.voting.voteOn') }} {{ prettyStartAt }}</div>
        <div class="createdby">{{ $t('app.voting.createdBy') }} {{ getCreatedByName(props.topic.createdBy) }} (#{{ props.topic._id }})</div>
      </div>
      <div class="status">
        <template v-if="props.editable">
          <button :title="$t('app.voting.editTopic')" @click="emit('edit')">
            {{ $t('app.voting.editTopic') }}
          </button>
        </template>
        <button :class="[ props.status ]" :title="actualStatusStr" @click="emit('action', props.status)">
          {{ actualStatusStr }}
        </button>
        <button :title="$t('app.voting.recreateTopic')" class="recreate" @click="emit('recreate')">
          {{ $t('app.voting.recreateTopic') }}
        </button>
      </div>

      <div v-if="status === 'result'" class="duration expired">
      {{ $t('app.voting.expired') }}
      </div>
      <div v-else class="duration">{{ $t('app.voting.period')}} : {{ prettyDuation }}</div>
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
  (e: 'recreate') : void,
  (e: 'action', v:TopicCardStatus) : void,
  (e: 'approve', v:boolean) : void,
}>();

const actualStatusStr = computed(() => {
  return i18n.t(`app.voting.status.${props.status}`, i18n.t('app.voting.status.access'))
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

function getCreatedByName(createdBy?: UserBasicResponseDataWithId) {
  if(createdBy && createdBy.firstName) {
    return createdBy.lastName ? `${createdBy.firstName} ${createdBy.lastName}` : createdBy.firstName;
  }

  if(createdBy && createdBy.email) {
    return createdBy.email;
  }
  

  if(createdBy && createdBy._id) {
    return createdBy._id;
  }

  return "-";
}

</script>

<style scoped>
.dga-topic-card {
  @apply rounded-lg shadow-lg bg-red-800 pl-4 sm:pl-6 overflow-hidden;
}
.dga-topic-card.public {
  @apply bg-green-700
}

.dga-topic-card > .inner {
  @apply rounded-lg bg-white grid items-center p-2 sm:p-4 gap-2 sm:gap-y-0 overflow-auto;
  grid-template-areas: "public duration" "content content" "status status";
  grid-template-columns: 150px auto;
}

@media (min-width: 640px) {
  .dga-topic-card > .inner {
    grid-template-areas: "public content status" "duration content status";
    grid-template-columns: 150px auto 120px;
  }
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
  @apply flex flex-col justify-center gap-2
}
.dga-topic-card > .inner > .status > * {
  @apply rounded-full w-full max-w-[160px] sm:max-w-none mx-auto px-3 py-1 text-center text-sm text-white bg-dga-orange;
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