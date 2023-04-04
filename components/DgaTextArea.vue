<template>
  <textarea :value="value" :placeholder="props.placeholder" :required="props.required" class="dga-textarea"></textarea>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    modelValue?: any,
    placeholder?: string,
    required?: boolean,
  }>(), {});
  
  const value = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emit("update:modelValue", value)
    }
  })

  const emit = defineEmits<{
    (e: "update:modelValue", v: any) : void,
  }>();
</script>

<style scoped>
.dga-textarea {
  @apply transition duration-200 text-dga-orange border-2 border-dga-orange placeholder:text-dga-orange/50 rounded-2xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-dga-orange/50;
}
</style>