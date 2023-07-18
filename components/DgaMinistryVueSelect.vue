<template>
  <DgaVueSelect
    v-model="modelValue"
    :options="thaiMinitries"
    taggable
    clearable
    :disabled="props.disabled"
    :placeholder="$t('app.ministry')"
  ></DgaVueSelect>
</template>

<script setup lang="ts">
import { thaiMinitries } from "~/src/services/form/ministry";

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: any): void;
}>();

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
</script>
