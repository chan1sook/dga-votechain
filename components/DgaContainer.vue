<template>
  <div class="dga-container-root text-dga-blue">
    <DgaNav></DgaNav>
    <div class="dga-container flex-1 relative overflow-auto">
      <slot></slot>
    </div>
    <DgaFooter></DgaFooter>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.dga-container-root {
  @apply min-h-screen flex flex-col
}
</style>