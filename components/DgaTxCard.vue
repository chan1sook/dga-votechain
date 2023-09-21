<template>
  <div class="dga-tx-card" :class="[props.status || 'pending']">
    <div class="inner">
      <div class="voteid"><slot name="voteid"></slot></div>
      <div class="tx"><slot name="txid"></slot></div>
      <div class="type"><slot name="type"></slot></div>
      <div class="content"><slot></slot></div>
      <div class="status">
        <button v-if="props.status === 'valid'" class="valid cursor-default">
          {{ $t("app.admin.blockchain.blockInfo.mined") }}
        </button>
        <button
          v-else-if="props.status === 'invalid'"
          class="invalid cursor-default"
        >
          {{ $t("app.admin.blockchain.blockInfo.invalid") }}
        </button>
        <button
          v-else-if="props.status === 'norecord'"
          class="norecord cursor-default"
        >
          {{ $t("app.admin.blockchain.blockInfo.norecord") }}
        </button>
        <button v-else class="pending cursor-default">
          {{ $t("app.admin.blockchain.blockInfo.pending") }}
        </button>
        <button class="detail" @click="emit('detail')">
          {{ $t("app.detail") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  status?: TxStatus;
}>();

const emit = defineEmits<{
  (e: "detail"): void;
}>();
</script>

<style scoped>
.dga-tx-card {
  @apply overflow-hidden rounded-lg bg-red-800 pl-4 shadow-lg md:pl-6;
}
.dga-tx-card.mined {
  @apply bg-green-700;
}

.dga-tx-card > .inner {
  @apply grid items-center gap-2 overflow-auto rounded-lg bg-white p-2 md:gap-y-0 md:p-4;
  grid-template-areas: "voteid" "tx" "type" "content" "status";
  grid-template-columns: auto;
}

@media (min-width: 768px) {
  .dga-tx-card > .inner {
    grid-template-areas: "voteid voteid voteid" "tx tx tx" "type content status" "type content status";
    grid-template-columns: 150px auto 120px;
  }
}

.dga-tx-card > .inner > .private {
  grid-area: public;
  @apply text-xl text-red-700;
}
.dga-tx-card > .inner > .public {
  @apply text-green-700;
}

.dga-tx-card > .inner > .voteid {
  grid-area: voteid;
  @apply text-sm;
}

.dga-tx-card > .inner > .tx {
  grid-area: tx;
  @apply text-sm;
}
.dga-tx-card > .inner > .type {
  grid-area: type;
  @apply text-lg;
}

.dga-tx-card > .inner > .content {
  grid-area: content;
  @apply flex flex-row flex-wrap gap-x-4 gap-y-2;
}

.dga-tx-card > .inner > .status {
  grid-area: status;
  @apply flex flex-col gap-2;
}
.dga-tx-card > .inner > .status > * {
  @apply mx-auto w-full max-w-[160px] rounded-full bg-dga-orange px-3 py-1 text-center text-sm text-white md:max-w-none;
}
.dga-tx-card > .inner > .status > .valid {
  @apply bg-green-700;
}
.dga-tx-card > .inner > .status > .invalid {
  @apply bg-red-800;
}
.dga-tx-card > .inner > .status > .pending {
  @apply bg-gray-400;
}
.dga-tx-card > .inner > .status > .norecord {
  @apply bg-gray-400;
}
</style>
