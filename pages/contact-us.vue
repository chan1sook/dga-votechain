<template>
  <div>
    <DgaHead>{{ $t("app.contactUs.title") }}</DgaHead>
    <div
      v-html="sanitizeHtmlCustom(contactUsMessage)"
      class="custom-content-container"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { sanitizeHtmlCustom } from "~/src/services/formatter/html";
import {
  getStringConfigFieldByLocale,
  mapConfigKeysToAllLocales,
} from "~/src/services/transform/config";
const i18n = useI18n();

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.contactUs.title"
  )}`,
});

const serverConfigs = await useServerConfig(
  mapConfigKeysToAllLocales("contactUs")
);

const contactUsMessage = computed(() =>
  getStringConfigFieldByLocale("contactUs", i18n.locale.value, serverConfigs)
);
</script>
