<template>
  <div class="flex flex-col lg:flex-row px-4 sm:px-16 py-0 lg:py-12 gap-x-8 gap-y-4">
    <p class="sm:pt-4 text-xl sm:text-3xl lg:text-4xl lg:w-96 font-bold !leading-loose">
      {{ $t('home.header') }}
    </p>
    <div class="overflow-hidden flex-1">
      <img class="mx-auto max-w-none w-full sm:w-[400px]" src="~/assets/images/blockchain.png" />
    </div>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n()

definePageMeta({
  middleware: ["auth"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('home.title')}`
});
</script>