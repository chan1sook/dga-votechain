<template>
  <div class="dga-toast">
    <button class="absolute right-2 top-2" @click="emit('close')">
      <CloseIcon />
    </button>
    <slot> Hello World </slot>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "vue-material-design-icons/Close.vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<style scoped>
.dga-toast {
  @apply relative w-full max-w-sm rounded border border-gray-200 bg-white px-4 py-2 shadow transition duration-200 hover:shadow-md;
}
</style>
