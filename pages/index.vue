<template>
  <div>
    <div class="flex flex-col lg:flex-row px-4 sm:px-16 py-0 lg:py-12 gap-x-8 gap-y-4">
      <div>
        <p class="sm:pt-4 text-xl sm:text-3xl lg:text-4xl lg:w-96 font-bold !leading-loose">
          {{ $t('app.home.header') }}
        </p>
      </div>
      <div class="overflow-hidden flex-1">
        <img class="mx-auto max-w-none w-full sm:w-[400px]" src="~/assets/images/blockchain.png" />
      </div>
    </div>
    <div v-html="sanitizeHtmlCustom(indexMessage)" class="custom-content-container"></div>
  </div>
</template>

<script setup lang="ts">
import { sanitizeHtmlCustom } from '~/src/services/formatter/html';
const i18n = useI18n();

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.home.title')}`
});

const serverConfigs = await useServerConfig([
  "homeContentTH",
  "homeContentEN",
]);

const indexMessage = computed(() => {
  let result = "";
  if(i18n.locale.value === 'th') {
    result = serverConfigs.homeContentTH || "";
  } else {
    result = serverConfigs.homeContentEN || "";
  }
  return result || serverConfigs.homeContentTH || serverConfigs.homeContentEN || "";
})

onMounted(() => {
  if(!useSessionData().value.userid) {
    useVisibleMenuGroup().value = 'user';
  }
})
</script>