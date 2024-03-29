<template>
  <div class="dga-topic-card" :class="[topicType]">
    <div class="inner">
      <div class="type" :class="[topicType]">
        {{ $t(`app.topicType.${topicType}`, topicType) }}
      </div>
      <div class="content">
        <div class="name my-1">{{ props.topic.name }}</div>
        <div v-if="props.topic.createdBy" class="createdBy my-1">
          {{ $t("app.voting.createdBy") }}
          {{ formatCreatedByName(props.topic.createdBy) }}
        </div>
        <div class="break"></div>
        <div class="time my-1">
          {{ $t("app.voting.voteOn") }} {{ prettyStartAt }}
        </div>
        <div class="ticketid my-1">#Ticket {{ props.topic._id }}</div>
      </div>
      <div v-if="props.withQrcode" class="qr">
        <button :title="$t('app.voting.qrcode')" @click="emit('qr')">
          <QrcodeIcon />
        </button>
      </div>
      <div class="status">
        <button
          v-if="props.editable"
          :title="$t('app.voting.editTopic')"
          @click="emit('edit')"
        >
          {{ $t("app.voting.editTopic") }}
        </button>
        <button
          v-if="!props.isDev"
          :class="[props.status]"
          class="flex flex-row items-center justify-center gap-1"
          :title="actualStatusStr"
          @click="emit('action', props.status)"
        >
          <span>{{ actualStatusStr }}</span>
          <MagnifyIcon v-if="props.status === 'result'" />
        </button>
        <button
          v-if="props.isAdmin"
          :title="$t('app.voting.recreateTopic')"
          class="recreate flex flex-row items-center justify-center gap-1"
          @click="emit('recreate')"
        >
          <span>{{ $t("app.voting.recreateTopic") }}</span>
          <RefreshIcon />
        </button>
        <template v-if="props.isDev">
          <button
            v-if="props.topic.hidden"
            :title="$t('app.topic.show.title')"
            class="show flex flex-row items-center justify-center gap-1"
            @click="emit('show')"
          >
            <span>{{ $t("app.topic.show.title") }}</span>
            <EyeIcon />
          </button>
          <button
            v-else
            :title="$t('app.topic.hide.title')"
            class="hide flex flex-row items-center justify-center gap-1"
            @click="emit('hide')"
          >
            <span>{{ $t("app.topic.hide.title") }}</span>
            <EyeRemoveIcon />
          </button>
        </template>
      </div>

      <div v-if="status === 'result'" class="duration expired">
        {{ $t("app.voting.expired") }}
      </div>
      <div v-else class="duration">
        {{ $t("app.voting.period") }} : {{ prettyDuation }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QrcodeIcon from "vue-material-design-icons/Qrcode.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import EyeIcon from "vue-material-design-icons/Eye.vue";
import EyeRemoveIcon from "vue-material-design-icons/EyeRemove.vue";
import RefreshIcon from "vue-material-design-icons/Refresh.vue";
import { formatCreatedByName } from "~/src/services/formatter/user";
import dayjs from "dayjs";

const i18n = useI18n();

const props = withDefaults(
  defineProps<{
    topic: TopicResponseData;
    editable?: boolean;
    isAdmin?: boolean;
    isDev?: boolean;
    withQrcode?: boolean;
    status?: TopicCardStatus;
  }>(),
  {
    status: "access",
  }
);

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "recreate"): void;
  (e: "hide"): void;
  (e: "show"): void;
  (e: "remove"): void;
  (e: "qr"): void;
  (e: "action", v: TopicCardStatus): void;
  (e: "approve", v: boolean): void;
}>();

const actualStatusStr = computed(() => {
  return i18n.t(
    `app.voting.status.${props.status}`,
    i18n.t("app.voting.status.access")
  );
});

const topicType = computed(() => {
  return props.topic.type;
});

const prettyDuation = computed(() => {
  const originalDuration = dayjs(props.topic.voteExpiredAt).diff(
    props.topic.voteStartAt
  );
  const days = Math.floor(originalDuration / (24 * 60 * 60 * 1000));
  if (days >= 1) {
    return `${days} ${i18n.t("app.timePeriod.day", { count: days })}`;
  }

  const hours = Math.floor(originalDuration / (60 * 60 * 1000));
  if (hours >= 1) {
    return `${hours} ${i18n.t("app.timePeriod.hour", { count: hours })}`;
  }

  const minutes = Math.floor(originalDuration / (60 * 1000));
  if (minutes >= 1) {
    return `${minutes} ${i18n.t("app.timePeriod.minute", { count: minutes })}`;
  }

  return i18n.t("app.stimePeriod.nearZeroMinute");
});

const prettyStartAt = computed(() => {
  return i18n.d(dayjs(props.topic.voteStartAt).toDate(), "long");
});
</script>

<style scoped>
.dga-topic-card {
  @apply overflow-hidden rounded-lg bg-red-800 pl-4 text-sm shadow-lg sm:pl-6 lg:text-base;
}
.dga-topic-card.public {
  @apply bg-green-700;
}
.dga-topic-card.internal {
  @apply bg-blue-700;
}

.dga-topic-card > .inner {
  @apply grid items-center gap-2 overflow-auto rounded-lg bg-white p-2 sm:gap-y-0 sm:p-4;
  grid-template-areas: "type duration duration" "content content content" "status status qr";
  grid-template-columns: 150px auto 50px;
}

@media (min-width: 640px) {
  .dga-topic-card > .inner {
    grid-template-areas: "type content qr status" "duration content qr status";
    grid-template-columns: 150px auto 50px 120px;
  }
}

.dga-topic-card > .inner > .type {
  grid-area: type;
}
.dga-topic-card > .inner > .type.private {
  @apply text-red-700;
}
.dga-topic-card > .inner > .type.public {
  @apply text-green-700;
}
.dga-topic-card > .inner > .type.internal {
  @apply text-blue-700;
}

.dga-topic-card > .inner > .content {
  grid-area: content;
  @apply flex flex-row flex-wrap items-center gap-x-4 lg:gap-y-0;
}
.dga-topic-card > .inner > .content > .name {
  @apply w-full text-base font-bold lg:w-auto lg:text-xl;
}

.dga-topic-card > .inner > .content > .break {
  @apply h-0 w-full;
}

.dga-topic-card > .inner > .qr {
  grid-area: qr;
  @apply flex flex-col justify-center gap-2;
}
.dga-topic-card > .inner > .status {
  grid-area: status;
  @apply flex flex-col justify-center gap-2;
}
.dga-topic-card > .inner > .status > * {
  @apply mx-auto w-full max-w-[160px] rounded-full bg-dga-orange px-3 py-1 text-center text-sm text-white sm:max-w-none;
}
.dga-topic-card > .inner > .status > .voted {
  @apply bg-dga-blue;
}
.dga-topic-card > .inner > .status > .finished {
  @apply bg-blue-700;
}
.dga-topic-card > .inner > .status > .access,
.dga-topic-card > .inner > .status > .control,
.dga-topic-card > .inner > .status > .voting {
  @apply bg-green-700;
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
