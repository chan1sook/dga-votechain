<template>
  <Transition 
    enter-from-class="transition duration-500 opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="transition duration-500 opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="props.show" class="z-[1000] fixed inset-0 p-2 sm:p-4 bg-gray-500/50 flex flex-row items-center justify-center" @click="backdropClose">
      <div class="bg-dga-blue rounded-lg p-6 text-white flex flex-col gap-4" @click.stop>
        <slot>Modal</slot>
        <div v-if="!props.hideButtons" class="flex flex-row items-center justify-center gap-4">
          <template v-if="props.closeOnly">
            <DgaButton color="dga-orange" :title="$t('app.modal.close')" @click="emit('close')">{{ $t('app.modal.close') }}</DgaButton>
          </template>
          <template v-else>
            <DgaButton color="dga-orange" :title="$t('app.modal.cancel')" @click="emit('cancel')">{{ $t('app.modal.cancel') }}</DgaButton>
            <DgaButton color="green" :title="$t('app.modal.confirm')" @click="emit('confirm')">{{ $t('app.modal.confirm')}}</DgaButton>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props =  defineProps<{
  cancelBackdrop?: boolean,
  hideButtons?: boolean,
  closeOnly?: boolean,
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