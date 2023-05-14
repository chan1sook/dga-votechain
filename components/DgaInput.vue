<template>
  <input :type="props.type" :value="props.modelValue" :placeholder="props.placeholder" :required="props.required" :disabled="props.disabled"
    class="dga-input" @input="event => emit('update:modelValue', event.target.value)"/>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    modelValue?: any,
    type?: string,
    placeholder?: string,
    required?: boolean,
    disabled?: boolean,
  }>(), {
    type: "text",
  });

  const emit = defineEmits<{
    (e: "update:modelValue", v: any) : void,
  }>();
</script>

<style scoped>
.dga-input {
  @apply transition duration-200 text-dga-orange border-2 border-dga-orange placeholder:text-dga-orange/50 rounded-2xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-dga-orange/50;
}
</style>