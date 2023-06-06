<template>
  <div class="grid grid-cols-12 items-center gap-x-4 gap-y-2 max-w-4xl mx-auto my-4">
    <div class="col-span-12 md:col-span-2">
      {{ $t('app.topic.templateTitle') }}
    </div>
    <DgaSelect v-model="templateName" class="col-span-12 md:col-span-10" :options="templateOptions"></DgaSelect>
    <DgaButtonGroup class="col-span-12 mt-4">
      <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
        color="dga-orange" :title="$t('app.topic.applyTemplate')" @click="emit('useTemplate', templateName)"
      >
        <FloppyIcon />
        <span class="truncate">{{ $t('app.topic.applyTemplate') }}</span>
      </DgaButton>
      <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
        :title="$t('app.modal.back')" @click="emit('cancel')"
      >
        <CloseIcon />
        <span class="truncate">{{ $t('app.modal.back') }}</span>
      </DgaButton>
    </DgaButtonGroup>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import FloppyIcon from 'vue-material-design-icons/Floppy.vue';

const props = withDefaults(defineProps<{
  template?: string
}>(), {
  template: "yesno"
});

const i18n = useI18n();

const emit = defineEmits<{
  (e: "cancel", v: void): void,
  (e: "useTemplate", v: string): void,
}>();

const templateName = ref("yesno");
const templateOptions = computed(() => ["yesno", "option2", "option3"].map((ele) => {
  return {
    label: i18n.t(`app.topic.template.${ele}.label`),
    value: ele
  }
}))

const templatePropRef = computed(() => props.template);
watch(templatePropRef, (value) => {
  templateName.value = value;
}, { immediate: true })
</script>

<style scoped>
</style>