<template>
  <div>
    <div
      class="flex flex-col gap-x-8 gap-y-4 px-4 py-0 sm:px-16 lg:flex-row lg:py-12"
    >
      <div>
        <p
          class="text-xl font-bold !leading-loose sm:pt-4 sm:text-3xl lg:w-96 lg:text-4xl"
        >
          {{ $t("app.home.header") }}
        </p>
      </div>
      <div class="flex-1 overflow-hidden">
        <img
          class="mx-auto w-full max-w-none sm:w-[400px]"
          :src="homeImageURL"
        />
      </div>
    </div>
    <div
      v-html="sanitizeHtmlCustom(indexMessage)"
      class="custom-content-container"
    ></div>
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
import { HOME_IMAGE_URL } from "~/src/defaults";

const i18n = useI18n();

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t("app.home.title")}`,
});

const serverConfigs = await useServerConfig(
  mapConfigKeysToAllLocales("homeContent").concat(["homeImageURL"])
);

const indexMessage = computed(() =>
  getStringConfigFieldByLocale("homeContent", i18n.locale.value, serverConfigs)
);

const homeImageURL = ref(
  sanitizeUrl(
    getStringConfigField("homeImageURL", serverConfigs) || HOME_IMAGE_URL
  )
);

onMounted(() => {
  if (!useSessionData().value.userid) {
    useVisibleMenuGroup().value = "user";
  }
});
</script>
