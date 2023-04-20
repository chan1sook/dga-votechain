<template>
  <div class="relative">
    <div 
      class="bg-white flex border-2 font-bold text-dga-orange border-dga-orange rounded-2xl items-center overflow-hidden"
      :class="[showOption ? 'rounded-b-none' : '']"
      @click="toggleShowOption"
    >
      <input :value="selectionLabel" readonly class="cursor-pointer px-4 py-1 appearance-none outline-none w-full" />
      <label class="cursor-pointer outline-none focus:outline-none">
        <svg class="w-4 h-4 mx-2 fill-current" :class="[showOption ? 'trasnform rotate-180': '']" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </label>
    </div>
    <div v-if="showOption" class="z-[200] absolute text-dga-orange rounded-b-2xl shadow bg-white overflow-hidden flex flex-col w-full mt-0 border-2 border-t-0 border-dga-orange">
      <div v-for="option of props.options" class="cursor-pointer group border-t first:border-t-0" >
        <button 
          class="block w-full text-left px-4 py-1 border-transparent group-hover:bg-gray-100"
          @click="emitData(option)"
        >
          {{ labelOf(option) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ISelect {
  label: string,
  value: any
}

const props = withDefaults(defineProps<{
  modelValue?: any, 
  options?: Array<string | ISelect>
}>(), {
  options: () => [],
});

const showOption = ref(false);

function toggleShowOption() {
  showOption.value = !showOption.value;
}

const emit = defineEmits<{
  (e: "update:modelValue", v: any) : void,
}>();

function labelOf(option: string | ISelect) {
  return (typeof option === "object") ? option.label : option;
}

const selectionLabel = computed(() => {
  const target = props.options.find((ele) => ele === props.modelValue || (typeof ele === "object" && ele.value === props.modelValue));
  if(target) {
    return labelOf(target);
  }

  return ""
});

function emitData(data: string | ISelect) {
  if(typeof data === "object") {
    emit("update:modelValue", data.value)
  } else {
    emit("update:modelValue", data)
  }
  showOption.value = false;
}

</script>

<style scoped>
</style>