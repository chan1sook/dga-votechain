<template>
  <div class="dga-tab">
    <div
      v-for="(v, k) of props.tabs"
      class="dga-tab-item"
      :class="[props.modelValue === k ? 'is-active' : '']"
      @click="emit('update:modelValue', k.toString())"
    >
      {{ v }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    tabs: { [key: string]: string };
  }>(),
  {
    tabs: () => ({}),
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();
</script>
<style scoped>
.dga-tab {
  @apply flex select-none flex-row items-center gap-4 transition duration-200;
}
.dga-tab .dga-tab-item {
  @apply cursor-pointer whitespace-nowrap border-b-4 border-transparent px-2 pb-2 pt-1 font-bold transition duration-100 hover:text-dga-orange;
}
.dga-tab .dga-tab-item.is-active {
  @apply border-b-[3px] border-dga-orange text-dga-orange;
}
</style>
