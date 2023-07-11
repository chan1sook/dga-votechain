<template>
  <div>
    <DgaHead>{{ $t("app.privacyPolicy") }}</DgaHead>
    <div v-html="sanitizeHtmlCustom(privacyPolicyMessage)" class="my-2 custom-content-container max-w-4xl mx-auto"></div>
  </div>
</template>

<script setup lang="ts">
import { sanitizeHtmlCustom } from '~/src/services/formatter/html';
import { getStringConfigFieldByLocale, mapConfigKeysToAllLocales } from '~/src/services/transform/config';

const i18n = useI18n();

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.privacyPolicy')}`
});

const serverConfigs = await useServerConfig(
  mapConfigKeysToAllLocales("privacyPolicy")
);

const privacyPolicyMessage = computed(() => getStringConfigFieldByLocale("privacyPolicy", i18n.locale.value, serverConfigs));
</script>