<template>
  <div class="fixed inset-0 p-8 pt-24 pointer-events-none overflow-hidden flex gap-4 flex-col items-end">
    <TransitionGroup 
      enter-from-class="transition duration-500 opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="transition duration-500 opacity-100"
      leave-to-class="opacity-0"
    >
      <DgaToast v-for="toast of toastArr" :key="toast.id" class="pointer-events-auto" @close="hideToast(toast)">
        <h2 class="font-bold">{{ toast.title }}</h2>
        <SimpleContentFormatter v-if="toast.content" :content="toast.content" class="mt-2"></SimpleContentFormatter>
      </DgaToast>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { nanoid } from 'nanoid';
  
const toastArr : Ref<Array<ToastData>> = ref([]);

function watchToastData() {
  const toastData = useToastData().value;
  for(const t of toastData) {
    showSingleToast(t);
  }
  useToastData().value = [];
}

let updateId: NodeJS.Timer | undefined;
onMounted(() => {
  updateId = setInterval(watchToastData, 50);
  watchToastData();
})

onUnmounted(() => {
  clearInterval(updateId);
})

function hideToast(data: ToastData) {
  const index = toastArr.value.indexOf(data)
  if(index !== -1) {
    toastArr.value.splice(index, 1);
  }
}

function showSingleToast(params:ToastParams) {
  const data = {
    id: nanoid(),
    ...params,
  };

  if(toastArr.value.some((ele) => ele.id === data.id)) {
    hideToast(data);
  }

  let delay: number | undefined;
  if(typeof data.autoCloseDelay !== "number") {
    delay = 0;
  } else {
    delay = data.autoCloseDelay;
  }
  
  if(typeof delay === "number" && delay > 0) {
    data.timeoutId = setTimeout(() => {
      hideToast(data);
    }, delay);
  }

  toastArr.value.push(data);
}

function showToast(...params:Array<ToastParams>) {
  params.forEach(showSingleToast);
}

defineExpose({
  showToast
});


onUnmounted(() => {
  toastArr.value.forEach(hideToast);
})
</script>