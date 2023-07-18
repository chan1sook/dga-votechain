<template>
  <div class="flex flex-row items-center gap-x-1 gap-y-1">
    <ImageIcon />
    <div class="flex flex-row gap-1 md:w-20 md:flex-col">
      <template v-if="props.existsImage">
        <template v-if="actualImage === false">
          <label
            :for="eleId"
            class="dga-image-button bg-dga-orange text-white hover:bg-opacity-50"
          >
            {{ $t("app.add") }}
          </label>
          <div
            :for="eleId"
            class="dga-image-button bg-dga-blue text-white hover:bg-opacity-50"
            @click="unsetRemoveImage"
          >
            {{ $t("app.revert") }}
          </div>
        </template>
        <template v-else>
          <label
            :for="eleId"
            class="dga-image-button bg-dga-blue text-white hover:bg-opacity-50"
          >
            {{ $t("app.change") }}
          </label>
          <div
            class="dga-image-button bg-red-500 text-white hover:bg-opacity-50"
            @click="removeExistsImage"
          >
            {{ $t("app.remove") }}
          </div>
        </template>
      </template>
      <template v-else>
        <label
          v-if="!actualImage"
          :for="eleId"
          class="dga-image-button bg-dga-orange text-white hover:bg-opacity-50"
        >
          {{ $t("app.add") }}
        </label>
        <template v-else>
          <label
            :for="eleId"
            class="dga-image-button bg-dga-blue text-white hover:bg-opacity-50"
          >
            {{ $t("app.change") }}
          </label>
          <div
            class="dga-image-button bg-red-500 text-white hover:bg-opacity-50"
            @click="removeImage"
          >
            {{ $t("app.remove") }}
          </div>
        </template>
      </template>
    </div>
    <input
      :id="eleId"
      type="file"
      class="w-0 opacity-0"
      accept="image/jpeg,image/x-png"
      @change="changeFile"
    />
    <MagnifyIcon
      v-if="actualImageURL !== GRAY_BASE64_IMAGE"
      class="md:hidden"
      @click="showImageModal = true"
    />
    <img
      :src="actualImageURL"
      class="col-span-4 row-span-2 hidden max-h-24 w-24 cursor-pointer md:col-span-2 md:block"
      @click="showImageModal = true"
    />
    <DgaModal
      :show="showImageModal"
      cancel-backdrop
      close-only
      @close="showImageModal = false"
    >
      <img :src="actualImageURL" class="max-h-[77.5vh] object-contain" />
    </DgaModal>
  </div>
</template>

<script setup lang="ts">
import ImageIcon from "vue-material-design-icons/Image.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";

import { nanoid } from "nanoid";
import { GRAY_BASE64_IMAGE } from "~/src/services/formatter/image";

const props = withDefaults(
  defineProps<{
    modelValue?: File | false;
    existsImage?: string;
  }>(),
  {}
);

const emit = defineEmits<{
  (e: "update:modelValue", v: File | undefined | false): void;
}>();

const uid = ref(nanoid());
const eleId = computed(() => "imageinput-" + uid.value);

const actualImage: Ref<File | undefined | false> = ref(undefined);
const imageUri: Ref<string | null> = ref(null);
const showImageModal = ref(false);
const modelValue = computed(() => props.modelValue);

const actualImageURL = computed(() => {
  if (imageUri.value) {
    return imageUri.value;
  }

  if (props.existsImage && actualImage.value !== false) {
    return props.existsImage;
  }
  return GRAY_BASE64_IMAGE;
});

function changeFile(ev: Event) {
  const target = ev.target;
  if (target instanceof HTMLInputElement) {
    if (target.files && target.files.length > 0) {
      actualImage.value = target.files[0];
    }
  }
}

function removeImage() {
  actualImage.value = undefined;
}

function unsetRemoveImage() {
  actualImage.value = undefined;
}

function removeExistsImage() {
  actualImage.value = false;
}

watch(
  modelValue,
  (value) => {
    actualImage.value = value;
  },
  { immediate: true }
);

watch(actualImage, (value) => {
  if (imageUri.value) {
    URL.revokeObjectURL(imageUri.value);
  }

  if (value) {
    imageUri.value = URL.createObjectURL(value);
  } else {
    imageUri.value = null;
  }

  emit("update:modelValue", value);
});

onUnmounted(() => {
  if (imageUri.value) {
    URL.revokeObjectURL(imageUri.value);
  }
});
</script>

<style scoped>
.dga-image-button {
  @apply w-16 cursor-pointer rounded-2xl px-2 py-1 text-center md:w-auto;
}
</style>
