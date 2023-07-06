<template>
  <div>
    <Editor
      v-model="content"
      api-key="p8pkrq40gyd97pv4jgodbqxrsx0c9w1y18mt277tfluopgde"
      :init="{
        plugins: props.plugins,
        toolbar: toolbar,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import Editor from '@tinymce/tinymce-vue'

const props = withDefaults(defineProps<{
  modelValue?: string,
  plugins?: string,
  toolbar?: string,
}>(), {
  plugins: 'lists link image table code help',
  // toolbar: 'numlist bullist',
});


const emit = defineEmits<{
  (e: "update:modelValue", v: string) : void,
}>();

const content = ref("");
const modelValue = computed(() => props.modelValue)

watch(modelValue, (value) => {
  content.value = value || "";
}, { immediate: true })

watch(content, (value) => {
  emit("update:modelValue", value);
})

</script>