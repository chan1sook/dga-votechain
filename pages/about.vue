<template>
  <div>
    <DgaHead>{{ $t("about.title") }}</DgaHead>
    <p class="my-4 text-md indent-8">{{ $t('about.info') }}</p>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n()

definePageMeta({
  middleware: ["auth"]
})

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('about.title')}`
});

</script>