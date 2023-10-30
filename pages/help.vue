<template>
  <div>
    <DgaHead>{{ $t("app.help.title") }}</DgaHead>
    <hr class="my-2" />
    <div class="flex flex-row flex-wrap gap-2">
      <a :href="helpPdfLink" class="my-2 underline">
        {{ $t("app.help.pdf") }}
      </a>
    </div>
    <hr class="my-2" />
    <ClientOnly>
      <VuePdfEmbed :source="helpPdfLink" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import VuePdfEmbed from "vue-pdf-embed";
import {
  getStringConfigFieldByLocale,
  mapConfigKeysToAllLocales,
} from "~/src/services/transform/config";
const i18n = useI18n();

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t("app.help.title")}`,
});

const serverConfigs = await useServerConfig(
  mapConfigKeysToAllLocales("helpPdf")
);

const helpPdfLink = computed(
  () =>
    getStringConfigFieldByLocale("helpPdf", i18n.locale.value, serverConfigs) ||
    "/pdf/help_1_0_1.pdf"
);
</script>
