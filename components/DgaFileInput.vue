<template>
  <div class="dga-input">
    <input :id="eleId" type="file" :required="props.required" :disabled="props.disabled" :accept="props.accept" class="hidden" 
      @change="changeFileName" />
    <label :for="eleId" class="block px-2 py-1 w-full rounded-2xl cursor-pointer">
      <template v-if="fileName">{{ fileName }}</template>
      <template v-else>{{ props.nofileText }}</template>
    </label>
  </div>
</template>

<script setup lang="ts">
import { nanoid } from 'nanoid';

  const props = withDefaults(defineProps<{
    modelValue?: any,
    nofileText?: string,
    required?: boolean,
    disabled?: boolean,
    accept?: string,
  }>(), {
    nofileText: "No File Selected"
  });

  const fileName = ref("");
  const uid = ref(nanoid());
  const eleId = computed(() => 'file-' + uid.value);

  const emit = defineEmits<{
    (e: "change", v: Event) : void,
  }>();
  function changeFileName(ev: Event) {
    const target = ev.target;
    if(target instanceof HTMLInputElement) {
      if(target.files && target.files.length > 0) {
        fileName.value = target.files[0].name;
      } else {
        fileName.value = "";
      }
    }

    emit("change", ev);
  }
</script>

<style scoped>
.dga-input {
  @apply transition duration-200 text-dga-orange border-2 border-dga-orange overflow-x-hidden placeholder:text-dga-orange/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dga-orange/50 disabled:bg-gray-200 disabled:text-dga-orange/75;
}
</style>