<template>
  <div class="dga-btn-group"
    :class="[larger ? 'larger' : '']"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  larger?: boolean,
}>();

</script>
<style scoped>
  .dga-btn-group {
    @apply mx-auto flex flex-col md:flex-row flex-wrap justify-center gap-2;
  }
  .dga-btn-group > :deep(*) {
    @apply mx-auto md:mx-0 w-full max-w-sm block;
  }
  .dga-btn-group.larger > :deep(*) {
    @apply max-w-md;
  }
</style>