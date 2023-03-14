<template>
  <span class="material-symbols-outlined">{{ icon }}</span>
</template>

<script setup lang="ts">
const { icon } = defineProps<{ icon: string }>();
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 48
}
</style>