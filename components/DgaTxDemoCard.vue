<template>
  <div class="dga-tx-demo-card" :class="[props.mined ? 'mined' : '']">
    <div class="inner">
      <div class="tx"><slot name="txid"></slot></div>
      <div class="type"><slot name="type"></slot></div>
      <div class="content"><slot></slot></div>
      <div class="status">
        <button v-if="props.mined" class="mined" @click="emit('detail')">
          Mined
        </button>
        <button v-else class="pending">
          Pending
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
.dga-tx-demo-card {
  @apply rounded-lg shadow-lg bg-red-800 pl-6
}
.dga-tx-demo-card.mined {
  @apply bg-green-700
}

.dga-tx-demo-card > .inner {
  @apply rounded-lg bg-white grid items-center px-4 py-4;
  grid-template-areas: "tx content status" "type content status";
  grid-template-columns: 150px auto 100px;
}

.dga-tx-demo-card > .inner > .private {
  grid-area: public;
  @apply text-xl text-red-700;
}
.dga-tx-demo-card > .inner > .public {
  @apply text-green-700;
}

.dga-tx-demo-card > .inner > .tx {
  grid-area: tx;
  @apply text-sm;
}
.dga-tx-demo-card > .inner > .type {
  grid-area: type;
  @apply text-lg;
}

.dga-tx-demo-card > .inner > .content {
  grid-area: content;
  @apply flex flex-row flex-wrap gap-y-2 gap-x-4
}
.dga-tx-demo-card > .inner > .content > .name {
  @apply w-full text-xl font-bold
}
.dga-tx-demo-card > .inner > .content > .time
{
  @apply flex-none
}
.dga-tx-demo-card > .inner > .status {
  grid-area: status;
  @apply flex flex-col gap-2
}
.dga-tx-demo-card > .inner > .status > * {
  @apply rounded-full px-3 py-1 text-center text-sm text-white bg-dga-orange;
}
.dga-tx-demo-card > .inner > .status > .mined  {
  @apply bg-green-700
}
.dga-tx-demo-card > .inner > .status > .pending {
  @apply bg-gray-400;
}
</style>