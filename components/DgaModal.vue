<template>
  <Transition
    enter-from-class="transition duration-500 opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="transition duration-500 opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="props.show"
      class="fixed inset-0 z-[1000] flex flex-col overflow-auto bg-gray-500/50 p-2 sm:p-4"
      @click="backdropClose"
    >
      <div
        class="m-auto flex flex-col gap-4 rounded-lg bg-dga-blue p-6 text-white"
        @click.stop
      >
        <slot>Modal</slot>
        <div
          v-if="!props.hideButtons"
          class="flex flex-row items-center justify-center gap-4"
        >
          <template v-if="props.closeOnly">
            <DgaButton
              color="dga-orange"
              :title="$t('app.modal.close')"
              @click="emit('close')"
            >
              {{ props.closeText || $t("app.modal.close") }}
            </DgaButton>
          </template>
          <template v-else>
            <DgaButton
              color="dga-orange"
              :title="$t('app.modal.cancel')"
              @click="emit('cancel')"
            >
              {{ props.cancelText || $t("app.modal.cancel") }}
            </DgaButton>
            <DgaButton
              color="green"
              :title="$t('app.modal.confirm')"
              @click="emit('confirm')"
              >{{ props.confirmText || $t("app.modal.confirm") }}</DgaButton
            >
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  cancelBackdrop?: boolean;
  hideButtons?: boolean;
  closeOnly?: boolean;
  show?: boolean;
  confirmText?: string;
  closeText?: string;
  cancelText?: string;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "close"): void;
  (e: "confirm"): void;
}>();

function backdropClose() {
  if (props.cancelBackdrop === true) {
    emit("close");
  }
}
</script>
