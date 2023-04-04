<template>
  <div class="dga-list-item hover:bg-gradient-to-r hover:from-slate-300/50 hover:to-slate-100/50" :class="topClass">
    <div class="header " :class="headerClass">
      <slot name="header">1.</slot>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { headerClass, noAnimation, unlimitLines } = defineProps({
    headerClass: {
      type: String,
      default: "w-8"
    },
    noAnimation: {
      type: Boolean,
      default: false,
    },
    unlimitLines: {
      type: Boolean,
      default: false,
    }
  });
  const { onClick } = useAttrs()
  const topClass = {
    "cursor-pointer": Boolean(onClick),
    "no-animation": noAnimation,
    "unlimit-lines": unlimitLines,
  }
</script>

<style scoped>
.dga-list-item {
  @apply flex flex-row divide-x-2 divide-dga-orange-lighter;
}
.dga-list-item > .header {
  @apply px-2 py-1 flex-none line-clamp-1 text-clip ;
}
.dga-list-item > .content {
  @apply px-2 py-1;
}
.dga-list-item:not(.no-animation) {
  @apply transition-transform duration-200 hover:translate-x-1;
}
.dga-list-item:not(.unlimit-lines) > .content {
  @apply line-clamp-3;
}
</style>