<template>
  <div>
    <DgaHead>{{ $t('contactUs.title') }}</DgaHead>
    <div class="my-4 flex flex-col gap-1"></div>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n();

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('contactUs.title')}`
});


</script>