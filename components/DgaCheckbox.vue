<template>
  <input v-model="value" :disabled="props.disabled" :required="props.required" type="checkbox" class="scale-125" />
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  modelValue?: any,
  required?: boolean,
  disabled?: boolean,
}>(), {
  required: false,
  disabled: false,
});

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