<template>
  <DgaModal :show="show" hide-buttons>
    <div class="flex flex-col gap-4 items-center">
      <MaterialIcon icon="hourglass_top" class="!text-4xl animate-spin"></MaterialIcon>
      <div>
        {{ $t('loading') }}...
      </div>
    </div>
  </DgaModal>
</template>

<script setup lang="ts">
const props =  defineProps<{
  show? : boolean,
}>();
</script>