<template>
  <div class="relative rounded-md px-2 py-1" :class="[props.withBorder ? 'border-2 border-dga-blue' : '']">
    <div class="flex-1 grid grid-cols-12 gap-2 items-center">
      <div class="col-span-12 sm:col-span-10 flex gap-2 items-center">
        <div class="flex-1">
          <slot name="default"></slot>
        </div>
        <div class="hidden sm:block whitespace-nowrap">
          <slot name="percent"></slot>
        </div>
      </div>
      <div class="col-span-12 sm:col-span-2 sm:pl-2 sm:border-l-2 border-dga-blue flex flex-row">
        <span class="flex-1 sm:hidden whitespace-nowrap">
          <slot name="percent"></slot>
        </span>
        <span class="sm:flex-1 text-right">
          <slot name="count"></slot>
        </span>
      </div>
    </div>
    <div v-if="props.withBorder" class="absolute left-0 top-0 bottom-0 bg-dga-blue opacity-25"
      :style="{ width: barPercentCss }"
    ></div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  withBorder?: boolean,
  barPercent?: number,
}>(), {
  barPercent: 0,
});

const barPercentCss = computed(() => {
  const cappedPercent = Math.max(Math.min(props.barPercent, 100), 0);
  return `${cappedPercent.toFixed(2)}%`
})
</script>