<template>
  <VueSelect v-model="modelValue" :options="props.options"
    :taggable="props.taggable" :clearable="props.clearable"
    :placeholder="props.placeholder" :disabled="props.disabled"
    :reduce="props.reduce"
    @search="search" :filterable="props.filterable"
    @change="emit('update:modelValue', $event)"
  >
    <template slot="no-options">
      <slot name="no-options"></slot>
    </template>
  </VueSelect>
</template>

<script setup lang="ts">
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css';

const props = withDefaults(defineProps<{
  modelValue?: any,
  options?: any[],
  taggable?: boolean,
  disabled?: boolean,
  clearable?: boolean,
  filterable?: boolean,
  reduce?: (arg0: any) => any,
  placeholder?: string,
}>(), {
  options: <any>[],
  clearable: false,
  taggable: false,
  filterable: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", v: any) : void,
  (e: "search", keyword: string, loading: (state: boolean) => void) : void,
}>();

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
});

function search(keyword: string, loading: (state: boolean) => void) {
  emit("search", keyword, loading);
}
</script>

<style>
:root {
  --vs-search-input-color: theme("colors.dga-blue.DEFAULT");
  --vs-search-input-placeholder-color: theme("colors.gray.500");
  --vs-state-disabled-bg: theme("colors.gray.200");
  --vs-border-color: theme("colors.dga-orange");
  --vs-border-width: theme("borderWidth.2");
  --vs-border-radius: theme("borderRadius.2xl");
  --vs-state-disabled-cursor: default;
  --vs-dropdown-option-padding: 3px 16px;
}

.vs__search {
  background: transparent !important;
}
</style>
<!-- <style scoped>
:root {
  --vs-colors--lightest: theme("colors.dga-orange");
  --vs-colors--light: rgba(60, 60, 60, 0.5);
  --vs-colors--dark: theme("colors.dga-blue.DEFAULT");
  --vs-colors--darkest: rgba(0, 0, 0, 0.15);

  /* Search Input */
  --vs-search-input-color: theme("colors.dga-blue.DEFAULT");
  --vs-search-input-bg: rgb(255, 255, 255);
  --vs-search-input-placeholder-color: theme("colors.gray.500");

  /* Font */
  --vs-font-size: 1rem;
  --vs-line-height: 1.4;

  /* Disabled State */
  --vs-state-disabled-bg: theme("colors.gray.200"); /* bg-gray-200 */
  --vs-state-disabled-color: var(--vs-colors--light);
  --vs-state-disabled-controls-color: var(--vs-colors--light);
  --vs-state-disabled-cursor: default;

  /* Borders */
  --vs-border-color: theme("colors.dga-orange");
  --vs-border-width: theme("borderWidth.2");
  --vs-border-style: solid;
  --vs-border-radius: theme("borderRadius.2xl");

  /* Actions: house the component controls */
  --vs-actions-padding: 4px 6px 0 3px;

  /* Component Controls: Clear, Open Indicator */
  --vs-controls-color: var(--vs-colors--light);
  --vs-controls-size: 1;
  --vs-controls--deselect-text-shadow: 0 1px 0 #fff;

  /* Selected */
  --vs-selected-bg: #f0f0f0;
  --vs-selected-color: var(--vs-colors--dark);
  --vs-selected-border-color: var(--vs-border-color);
  --vs-selected-border-style: var(--vs-border-style);
  --vs-selected-border-width: var(--vs-border-width);

  /* Dropdown */
  --vs-dropdown-bg: #fff;
  --vs-dropdown-color: inherit;
  --vs-dropdown-z-index: 1000;
  --vs-dropdown-min-width: 160px;
  --vs-dropdown-max-height: 350px;
  --vs-dropdown-box-shadow: 0px 3px 6px 0px var(--vs-colors--darkest);

  /* Options */
  --vs-dropdown-option-bg: #000;
  --vs-dropdown-option-color: var(--vs-dropdown-color);
  --vs-dropdown-option-padding: 3px 16px;

  /* Active State */
  --vs-dropdown-option--active-bg: #5897fb;
  --vs-dropdown-option--active-color: #fff;

  /* Deselect State */
  --vs-dropdown-option--deselect-bg: #fb5858;
  --vs-dropdown-option--deselect-color: #fff;

  /* Transitions */
  --vs-transition-timing-function: cubic-bezier(1, -0.115, 0.975, 0.855);
  --vs-transition-duration: 150ms;
}
</style> -->