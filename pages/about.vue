<template>
  <div>
    <DgaHead>{{ $t("app.about.title") }}</DgaHead>
    <div v-html="sanitizeHtmlCustom(aboutMessage)" class="custom-content-container"></div>
  </div>
</template>

<script setup lang="ts">
import { sanitizeHtmlCustom } from '~/src/services/formatter/html';
const i18n = useI18n();

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.about.title')}`
});

const serverConfigs = await useServerConfig([
  "aboutTH",
  "aboutEN",
]);

const aboutMessage = computed(() => {
  let result = "";
  if(i18n.locale.value === 'th') {
    result = serverConfigs.aboutTH || "";
  } else {
    result = serverConfigs.aboutEN || "";
  }
  return result || serverConfigs.aboutTH || serverConfigs.aboutEN || "";
})

</script>