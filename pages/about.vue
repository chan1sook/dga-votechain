<template>
  <div>
    <DgaHead>{{ $t("app.about.title") }}</DgaHead>
    <div
      v-html="sanitizeHtmlCustom(aboutMessage)"
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
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t("app.about.title")}`,
});

const serverConfigs = await useServerConfig(mapConfigKeysToAllLocales("about"));

const aboutMessage = computed(() =>
  getStringConfigFieldByLocale("about", i18n.locale.value, serverConfigs)
);
</script>
