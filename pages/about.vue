<template>
  <div>
    <DgaHead>{{ $t("about.title") }}</DgaHead>
    <p class="my-4 text-md indent-8"></p>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n();

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('about.title')}`
});

</script>