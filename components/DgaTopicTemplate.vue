<template>
  <div
    class="mx-auto my-4 grid max-w-4xl grid-cols-12 items-center gap-x-4 gap-y-2"
  >
    <div class="col-span-12 md:col-span-2">
      {{ $t("app.topic.templateTitle") }}
    </div>
    <DgaVueSelect
      v-model="templateName"
      class="col-span-12 md:col-span-10"
      :options="templateOptions"
      :reduce="(val) => val.value"
    ></DgaVueSelect>
    <DgaButtonGroup class="col-span-12 mt-4">
      <DgaButton
        class="!flex flex-row items-center justify-center gap-x-2 truncate"
        color="dga-orange"
        :title="$t('app.topic.applyTemplate')"
        @click="emit('useTemplate', templateName)"
      >
        <ArrowDownBoldOutlineIcon />
        <span class="truncate">{{ $t("app.topic.applyTemplate") }}</span>
      </DgaButton>
      <DgaButton
        class="!flex flex-row items-center justify-center gap-x-2 truncate"
        :title="$t('app.modal.back')"
        @click="emit('cancel')"
      >
        <ArrowLeftIcon />
        <span class="truncate">{{ $t("app.modal.back") }}</span>
      </DgaButton>
    </DgaButtonGroup>
  </div>
</template>

<script setup lang="ts">
import ArrowDownBoldOutlineIcon from "vue-material-design-icons/ArrowDownBoldOutline.vue";
import ArrowLeftIcon from "vue-material-design-icons/ArrowLeft.vue";

const props = withDefaults(
  defineProps<{
    template?: string;
  }>(),
  {
    template: "yesno",
  }
);

const i18n = useI18n();

const emit = defineEmits<{
  (e: "cancel", v: void): void;
  (e: "useTemplate", v: string): void;
}>();

const templateName = ref("yesno");
const templateOptions = computed(() =>
  ["yesno", "option2", "option3"].map((ele) => {
    return {
      label: i18n.t(`app.topic.template.${ele}.label`),
      value: ele,
    };
  })
);

const templatePropRef = computed(() => props.template);
watch(
  templatePropRef,
  (value) => {
    templateName.value = value;
  },
  { immediate: true }
);
</script>

<style scoped></style>
