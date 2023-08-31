<template>
  <div>
    <div
      class="flex flex-col gap-x-8 gap-y-4 px-4 py-0 sm:px-16 lg:flex-row lg:py-12"
    >
      <div>
        <div v-html="sanitizeHtmlCustom(indexTitleMessage)"></div>
      </div>
      <div class="flex-1 overflow-hidden">
        <img
          class="mx-auto w-full max-w-none sm:w-[400px]"
          :src="homeImageURL"
        />
      </div>
    </div>
    <div class="custom-content-container">
      <div v-html="sanitizeHtmlCustom(indexMessage)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sanitizeHtmlCustom } from "~/src/services/formatter/html";
import { sanitizeUrl } from "@braintree/sanitize-url";

import {
  getStringConfigField,
  getStringConfigFieldByLocale,
  mapConfigKeysToAllLocales,
} from "~/src/services/transform/config";
import { HOME_IMAGE_URL_TH, HOME_TITLE_CONTENT_TH } from "~/src/defaults";

const i18n = useI18n();

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t("app.home.title")}`,
});

const serverConfigs = await useServerConfig(
  mapConfigKeysToAllLocales("homeTitleContent", "homeImageUrl", "homeContent")
);

const indexTitleMessage = computed(
  () =>
    HOME_TITLE_CONTENT_TH ||
    getStringConfigFieldByLocale(
      "homeTitleContent",
      i18n.locale.value,
      serverConfigs
    )
);

const indexMessage = computed(() =>
  getStringConfigFieldByLocale("homeContent", i18n.locale.value, serverConfigs)
);

const homeImageURL = ref(
  sanitizeUrl(
    getStringConfigFieldByLocale(
      "homeImageUrl",
      i18n.locale.value,
      serverConfigs
    ) || HOME_IMAGE_URL_TH
  )
);

onMounted(() => {
  if (!useSessionData().value.userid) {
    useVisibleMenuGroup().value = "user";
  }
});
</script>
