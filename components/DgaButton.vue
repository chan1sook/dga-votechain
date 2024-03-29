<template>
  <NuxtLink
    v-if="props.href"
    :href="props.href"
    :disabled="props.disabled"
    class="dga-btn"
    :class="btnClasses"
  >
    <slot></slot>
  </NuxtLink>
  <button
    v-else
    :type="props.type"
    :disabled="props.disabled"
    class="dga-btn"
    :class="btnClasses"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
type DgaButtonTheme = "default" | "hollow" | "hollow2";
type DgaColorTheme =
  | "dga-orange"
  | "dga-blue"
  | "gray"
  | "gray2"
  | "green"
  | "red";
const props = defineProps<{
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  theme?: DgaButtonTheme;
  color?: DgaColorTheme;
  disabledVivid?: boolean;
  href?: string;
}>();

const btnClasses = computed(() => [
  props.color,
  props.theme,
  props.disabledVivid ? "vivid" : "",
]);
</script>

<style scoped>
.dga-btn {
  @apply select-none rounded-full border-2 border-transparent bg-dga-blue px-8 py-2 text-white transition duration-100
  hover:bg-dga-blue/80 focus:outline-none focus:ring-2 focus:ring-dga-blue/50 disabled:bg-dga-blue/50;
}
.dga-btn.hollow,
.dga-btn.hollow2 {
  @apply border-dga-blue bg-transparent text-dga-blue;
}
.dga-btn.hollow2:not(:disabled) {
  @apply hover:border-transparent hover:bg-dga-blue hover:text-white;
}
.dga-btn.vivid {
  @apply disabled:bg-dga-blue;
}
.dga-btn.hollow.vivid,
.dga-btn.hollow2.vivid {
  @apply disabled:bg-transparent;
}

.dga-btn.dga-orange {
  @apply bg-dga-orange  hover:bg-dga-orange/80 focus:ring-dga-orange/50 disabled:bg-dga-orange/50;
}
.dga-btn.dga-orange.hollow,
.dga-btn.dga-orange.hollow2 {
  @apply border-dga-orange bg-transparent text-dga-orange;
}
.dga-btn.dga-orange.hollow2:not(:disabled) {
  @apply hover:border-transparent hover:bg-dga-orange hover:text-white;
}
.dga-btn.dga-orange.vivid {
  @apply disabled:bg-dga-orange;
}

.dga-btn.gray {
  @apply border-gray-500 bg-gray-500 hover:bg-gray-500/80 focus:ring-gray-500/50  disabled:bg-gray-500/50;
}
.dga-btn.gray.hollow,
.dga-btn.green.hollow2 {
  @apply bg-transparent text-gray-500;
}
.dga-btn.gray.hollow2:not(:disabled) {
  @apply hover:border-transparent hover:bg-gray-500 hover:text-white;
}
.dga-btn.gray.vivid {
  @apply disabled:bg-gray-500;
}

.dga-btn.gray2 {
  @apply border-gray-300 bg-gray-300 hover:bg-gray-300/80 focus:ring-gray-500/50  disabled:bg-gray-300/50 disabled:text-gray-500;
}
.dga-btn.gray2.hollow2:not(:disabled) {
  @apply hover:border-transparent hover:bg-gray-300 hover:text-white;
}
.dga-btn.gray2.vivid {
  @apply disabled:bg-gray-300;
}

.dga-btn.green {
  @apply border-green-700 bg-green-700 hover:bg-green-700/80 focus:ring-green-700/50  disabled:bg-green-700/50;
}
.dga-btn.green.hollow,
.dga-btn.green.hollow2 {
  @apply bg-transparent text-green-700;
}
.dga-btn.green.hollow2:not(:disabled) {
  @apply hover:border-transparent hover:bg-green-700 hover:text-white;
}
.dga-btn.green.vivid {
  @apply disabled:bg-green-700;
}

.dga-btn.red {
  @apply bg-red-500  hover:bg-red-500/80 focus:ring-red-500/50 disabled:bg-red-500/50;
}
.dga-btn.red.hollow,
.dga-btn.red.hollow2 {
  @apply border-red-500 bg-transparent text-red-500;
}
.dga-btn.red.hollow2:not(:disabled) {
  @apply hover:border-transparent hover:bg-red-500 hover:text-white;
}
.dga-btn.red.vivid {
  @apply disabled:bg-red-500;
}
</style>
