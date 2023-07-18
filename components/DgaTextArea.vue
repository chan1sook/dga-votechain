<template>
  <textarea
    :value="value"
    :placeholder="props.placeholder"
    :required="props.required"
    class="dga-textarea"
    @input="(event) => emit('update:modelValue', event.target.value)"
  >
  </textarea>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: any;
    placeholder?: string;
    required?: boolean;
  }>(),
  {}
);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", v: any): void;
}>();
</script>

<style scoped>
.dga-textarea {
  @apply rounded-2xl border-2 border-dga-orange px-2 py-1 text-dga-orange transition duration-200 placeholder:text-dga-orange/50 focus:outline-none focus:ring-2 focus:ring-dga-orange/50;
}
</style>
