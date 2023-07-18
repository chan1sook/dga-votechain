<template>
  <div class="dga-container-root text-dga-blue">
    <DgaNav class="report-hide"></DgaNav>
    <div class="dga-container relative flex-1 overflow-auto">
      <slot></slot>
    </div>
    <DgaFooter class="report-hide"></DgaFooter>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.dga-container-root {
  @apply flex min-h-screen flex-col;
}

.dga-container {
  @apply px-2 py-4 sm:p-8;
}
</style>
