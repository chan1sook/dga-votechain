<template>
  <div class="dga-tx-card" :class="[props.mined ? 'mined' : '']">
    <div class="inner">
      <div class="tx"><slot name="txid"></slot></div>
      <div class="type"><slot name="type"></slot></div>
      <div class="content"><slot></slot></div>
      <div class="status">
        <button v-if="props.mined" class="mined cursor-default">
          {{ $t('blockchain.blockInfo.mined') }}
        </button>
        <button v-else class="pending cursor-default">
          {{ $t('blockchain.blockInfo.pending') }}
        </button>
        <button class="detail" @click="emit('detail')">
          {{ $t('blockchain.detail') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  mined?: boolean,
}>();

const emit = defineEmits<{
  (e: 'detail') : void,
}>();

</script>

<style scoped>
.dga-tx-card {
  @apply rounded-lg shadow-lg bg-red-800 pl-4 md:pl-6 overflow-hidden
}
.dga-tx-card.mined {
  @apply bg-green-700
}

.dga-tx-card > .inner {
  @apply rounded-lg bg-white grid items-center p-2 md:p-4 gap-2 md:gap-y-0 overflow-auto;
  grid-template-areas: "tx" "type" "content" "status";
  grid-template-columns: auto;
}

@media (min-width: 768px) {
  .dga-tx-card > .inner {
    grid-template-areas: "tx tx tx"  "type content status" "type content status";
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
  @apply flex flex-row flex-wrap gap-y-2 gap-x-4
}
.dga-tx-card > .inner > .content > .name {
  @apply w-full text-xl font-bold
}
.dga-tx-card > .inner > .content > .time
{
  @apply flex-none
}
.dga-tx-card > .inner > .status {
  grid-area: status;
  @apply flex flex-col gap-2
}
.dga-tx-card > .inner > .status > * {
  @apply rounded-full w-full max-w-[160px] md:max-w-none mx-auto px-3 py-1 text-center text-sm text-white bg-dga-orange;
}
.dga-tx-card > .inner > .status > .mined  {
  @apply bg-green-700
}
.dga-tx-card > .inner > .status > .pending {
  @apply bg-gray-400;
}
</style>