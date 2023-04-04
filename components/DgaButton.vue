<template>
  <NuxtLink v-if="props.href" :href="props.href" :disabled="props.disabled" class="dga-btn" :class="btnClasses">
    <slot></slot>
  </NuxtLink>
  <button v-else :type="props.type" :disabled="props.disabled" class="dga-btn" :class="btnClasses">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
type DgaButtonTheme = "default" | "hollow" | "hollow2";
type DgaColorTheme = "dga-orange" | "dga-blue" | "gray" | "green";
const props = defineProps<{
  type?: "button" | "submit" | "reset",
  disabled?: boolean,
  theme?: DgaButtonTheme,
  color?: DgaColorTheme,
  disabledVivid?: boolean,
  href?: string,
}>();

const btnClasses = computed(() => [
  props.color,
  props.theme,
  props.disabledVivid ? 'vivid' : '',
])

</script>

<style scoped>
.dga-btn {
  @apply transition duration-100 text-white bg-dga-blue px-8 py-2 rounded-full border-2 border-transparent select-none
  hover:bg-dga-blue/80 focus:outline-none focus:ring-2 focus:ring-dga-blue/50 disabled:bg-dga-blue/50;
}
.dga-btn.hollow, .dga-btn.hollow2 {
  @apply border-dga-blue text-dga-blue bg-transparent
}
.dga-btn.hollow2:not(:disabled) {
  @apply hover:bg-dga-blue hover:text-white hover:border-transparent
}
.dga-btn.vivid {
  @apply disabled:bg-dga-blue;
}
.dga-btn.hollow.vivid, .dga-btn.hollow2.vivid {
  @apply disabled:bg-transparent;
}

.dga-btn.dga-orange {
  @apply bg-dga-orange  hover:bg-dga-orange/80 focus:ring-dga-orange/50 disabled:bg-dga-orange/50;
}
.dga-btn.dga-orange.hollow, .dga-btn.dga-orange.hollow2 {
  @apply border-dga-orange text-dga-orange bg-transparent;
}
.dga-btn.dga-orange.hollow2:not(:disabled) {
  @apply hover:bg-dga-orange hover:text-white hover:border-transparent
}
.dga-btn.dga-orange.vivid {
  @apply disabled:bg-dga-orange;
}

.dga-btn.gray {
  @apply bg-gray-500 border-gray-500 hover:bg-gray-500/80 focus:ring-gray-500/50  disabled:bg-gray-500/50;
}
.dga-btn.gray.hollow, .dga-btn.green.hollow2 {
  @apply text-gray-500 bg-transparent;
}
.dga-btn.gray.hollow2:not(:disabled) {
  @apply hover:bg-gray-500 hover:text-white hover:border-transparent
}
.dga-btn.gray.vivid {
  @apply disabled:bg-gray-500;
}


.dga-btn.green {
  @apply bg-green-700 border-green-700 hover:bg-green-700/80 focus:ring-green-700/50  disabled:bg-green-700/50;
}
.dga-btn.green.hollow, .dga-btn.green.hollow2 {
  @apply text-green-700 bg-transparent;
}
.dga-btn.green.hollow2:not(:disabled) {
  @apply hover:bg-green-700 hover:text-white hover:border-transparent
}
.dga-btn.green.vivid {
  @apply disabled:bg-green-700;
}
</style>