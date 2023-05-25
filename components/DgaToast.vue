<template>
  <div class="dga-toast">
    <button class="absolute top-2 right-2" @click="emit('close')">
      <CloseIcon />
    </button>
    <slot>
      Hello World
    </slot>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';

const emit = defineEmits<{
  (e: 'close') : void,
}>();

</script>

<style scoped>
.dga-toast {
  @apply transition duration-200 relative px-4 py-2 w-full max-w-sm rounded border border-gray-200 shadow hover:shadow-md bg-white;
}
</style>