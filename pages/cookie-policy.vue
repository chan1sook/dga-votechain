<template>
  <div>
    <DgaHead>{{ $t("app.cookiePolicy") }}</DgaHead>
    <div
      v-html="sanitizeHtmlCustom(cookiePolicyMessage)"
      class="custom-content-container mx-auto mt-2 max-w-4xl"
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
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t("app.cookiePolicy")}`,
});

const serverConfigs = await useServerConfig(
  mapConfigKeysToAllLocales("cookiePolicy")
);

const cookiePolicyMessage = computed(() =>
  getStringConfigFieldByLocale("cookiePolicy", i18n.locale.value, serverConfigs)
);
</script>
