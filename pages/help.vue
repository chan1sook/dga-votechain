<template>
  <div>
    <DgaHead>{{ $t('app.help.title') }}</DgaHead>
    <hr class="my-2" />
    <div class="flex flex-row gap-2 flex-wrap">
      <a href="/pdf/help_1_0_0.pdf" class="my-2 underline">
        {{ $t('app.help.pdf') }}
      </a>
      <NuxtLink href="https://docs.google.com/document/d/1tWb_Zx8VD83nTTnBEYG8AibKrdPAgrsoCEM1WlfdLOA/edit#" class="my-2 underline">
        {{ $t('app.help.googleDocsVersion') }}
      </NuxtLink>
    </div>
    <hr class="my-2"/>
    <ClientOnly>
      <VuePdfEmbed source="/pdf/help_1_0_0.pdf"/>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import VuePdfEmbed from 'vue-pdf-embed'
const i18n = useI18n();

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.help.title')}`
});

</script>