<template>
  <input
    :type="props.type"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :required="props.required"
    :readonly="props.readonly"
    :disabled="props.disabled"
    class="dga-input"
    @input="(event) => emit('update:modelValue', event.target?.value)"
  />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: any;
    type?: string;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: "text",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: any): void;
}>();
</script>

<style scoped>
.dga-input {
  @apply rounded-2xl border-2 border-dga-orange px-2 py-1 text-dga-orange transition duration-200 placeholder:text-dga-orange/50 focus:outline-none focus:ring-2 focus:ring-dga-orange/50 disabled:bg-gray-200 disabled:text-dga-orange/75;
}
</style>
