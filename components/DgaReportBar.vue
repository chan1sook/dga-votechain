<template>
  <div
    class="relative rounded-md px-2 py-1"
    :class="[props.withBorder ? 'border-2 border-dga-blue' : '']"
  >
    <div class="grid flex-1 grid-cols-12 items-center gap-2">
      <div class="col-span-12 flex items-center gap-2 sm:col-span-10">
        <div class="flex-1">
          <slot name="default"></slot>
        </div>
        <div class="hidden whitespace-nowrap sm:block">
          <slot name="percent"></slot>
        </div>
      </div>
      <div
        class="col-span-12 flex flex-row border-dga-blue sm:col-span-2 sm:border-l-2 sm:pl-2"
      >
        <span class="flex-1 whitespace-nowrap sm:hidden">
          <slot name="percent"></slot>
        </span>
        <span class="text-right sm:flex-1">
          <slot name="count"></slot>
        </span>
      </div>
    </div>
    <div
      v-if="props.withBorder"
      class="absolute bottom-0 left-0 top-0 bg-dga-blue opacity-25"
      :style="{ width: barPercentCss }"
    ></div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    withBorder?: boolean;
    barPercent?: number;
  }>(),
  {
    barPercent: 0,
  }
);

const barPercentCss = computed(() => {
  const cappedPercent = Math.max(Math.min(props.barPercent, 100), 0);
  return `${cappedPercent.toFixed(2)}%`;
});
</script>
