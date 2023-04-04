<template>
  <Transition 
    enter-from-class="transition duration-500 opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="transition duration-500 opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="z-[1000] fixed inset-0 bg-gray-500/50 flex flex-row items-center justify-center" @click="backdropClose">
      <div class="bg-dga-blue rounded-lg p-6 text-white flex flex-col gap-4">
        <slot>Modal</slot>
        <div v-if="!hideButtons" class="flex flex-row items-center justify-center gap-4">
          <DgaButton color="dga-orange" @click="emit('cancel')">Cancel</DgaButton>
          <DgaButton color="green" @click="emit('confirm')">Confirm</DgaButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props =  defineProps<{
  cancelBackdrop?: boolean,
  hideButtons?: boolean,
  show? : boolean,
}>();

const emit = defineEmits<{
  (e:'cancel') : void,
  (e:'close') : void,
  (e:'confirm') : void
}>();

function backdropClose() {
  if(props.cancelBackdrop === true) {
    emit('close');
  }
}
</script>