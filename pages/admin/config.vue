<template>
  <div>
    <DgaHead>{{ $t('app.admin.config.title') }}</DgaHead>
    <div>WIP (Dev Config Only Page)</div>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-dev"]
})
useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.admin.config.title')}`
});
</script>