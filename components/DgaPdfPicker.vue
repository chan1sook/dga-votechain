<template>
  <div class="flex flex-row items-center gap-x-1 gap-y-1">
    <PdfIcon />
    <div class="flex flex-row gap-1 md:w-20 md:flex-col">
      <label
        :for="eleId"
        class="dga-image-button bg-dga-orange text-white hover:bg-opacity-50"
      >
        {{ $t("app.change") }}
      </label>
      <div
        v-if="modelValue"
        :for="eleId"
        class="dga-image-button bg-dga-blue text-white hover:bg-opacity-50"
        @click="unsetPdfFile"
      >
        {{ $t("app.revert") }}
      </div>
    </div>
    <input
      :id="eleId"
      type="file"
      class="w-0 opacity-0"
      accept="application/pdf"
      @change="changeFile"
    />
  </div>
</template>

<script setup lang="ts">
import PdfIcon from "vue-material-design-icons/FilePdfBox.vue";

import { nanoid } from "nanoid";

const props = withDefaults(
  defineProps<{
    modelValue?: File | false;
    existsPdf?: string;
  }>(),
  {}
);

const emit = defineEmits<{
  (e: "update:modelValue", v: File | undefined | false): void;
}>();

const uid = ref(nanoid());
const eleId = computed(() => "imageinput-" + uid.value);

const actualPdf: Ref<File | undefined | false> = ref(undefined);
const modelValue = computed(() => props.modelValue);

function changeFile(ev: Event) {
  const target = ev.target;
  if (target instanceof HTMLInputElement) {
    if (target.files && target.files.length > 0) {
      actualPdf.value = target.files[0];
    }
  }
}

function unsetPdfFile() {
  actualPdf.value = undefined;
}

watch(
  modelValue,
  (value) => {
    actualPdf.value = value;
  },
  { immediate: true }
);

watch(actualPdf, (value) => {
  emit("update:modelValue", value);
});
</script>

<style scoped>
.dga-image-button {
  @apply w-16 cursor-pointer rounded-2xl px-2 py-1 text-center md:w-auto;
}
</style>
