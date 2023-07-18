<template>
  <div class="dga-btn-group" :class="[larger ? 'larger' : '']">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  larger?: boolean;
}>();
</script>
<style scoped>
.dga-btn-group {
  @apply mx-auto flex flex-col flex-wrap justify-center gap-2 md:flex-row;
}
.dga-btn-group > :deep(*) {
  @apply mx-auto block w-full max-w-sm md:mx-0;
}
.dga-btn-group.larger > :deep(*) {
  @apply max-w-md;
}
</style>
