<template>
  <div>
    <DgaHead>{{ $t('help.title') }}</DgaHead>
    <hr class="my-2" />
    <div class="flex flex-row gap-2 flex-wrap">
      <a href="/pdf/help_0_0_2.pdf" class="my-2 underline">
        {{ $t('help.pdf') }}
      </a>
      <NuxtLink href="https://docs.google.com/document/d/1tWb_Zx8VD83nTTnBEYG8AibKrdPAgrsoCEM1WlfdLOA/edit#" class="my-2 underline">
        {{ $t('help.googleDocsVersion') }}
      </NuxtLink>
    </div>
    <hr class="my-2"/>
    <ClientOnly>
      <VuePdfEmbed source="/pdf/help_0_0_2.pdf"/>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import VuePdfEmbed from 'vue-pdf-embed'
const i18n = useI18n()

definePageMeta({
  middleware: ["auth"]
})

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('help.title')}`
});

</script>