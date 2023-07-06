<template>
  <div>
    <DgaHead>{{ $t('app.contactUs.title') }}</DgaHead>
    <div v-html="sanitizeHtmlCustom(contactUsMessage)" class="custom-content-container"></div>
  </div>
</template>

<script setup lang="ts">
import { sanitizeHtmlCustom } from '~/src/services/formatter/html';
const i18n = useI18n();

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.contactUs.title')}`
});

const serverConfigs = await useServerConfig([
  "contactUsTH",
  "contactUsEN",
]);

const contactUsMessage = computed(() => {
  let result = "";
  if(i18n.locale.value === 'th') {
    result = serverConfigs.contactUsTH || "";
  } else {
    result = serverConfigs.contactUsEN || "";
  }
  return result || serverConfigs.contactUsTH || serverConfigs.contactUsEN || "";
})
</script>