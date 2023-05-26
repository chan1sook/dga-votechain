<template>
  <div class="fixed bottom-4 right-4 max-w-xl rounded-lg bg-white shadow-md px-4 py-2">
    <div class="flex flex-col gap-4 items-center">
      <div>{{ $t('cookieConsent.useCookie') }}</div>
      <div class="flex flex-row flex-wrap gap-2">
        <div>{{ $t('cookieConsent.useCookieInfo1') }}</div>
        <div>{{ $t('cookieConsent.useCookieInfo2') }}</div> 
        <NuxtLink href="/privacy-policy" class="underline">{{ $t("privacyPolicy.title") }}</NuxtLink> 
        <NuxtLink href="/cookie-policy" class="underline">{{ $t("cookiePolicy.title") }}</NuxtLink> 
      </div>
      <div class="flex flex-col sm:flex-row w-full sm:w-auto mx-auto gap-2 text-sm">
        <DgaButton @click="emit('acceptAll')">
          {{ $t('cookieConsent.acceptAll') }}
        </DgaButton>
        <DgaButton theme="hollow" @click="emit('acceptRequired')">
          {{ $t('cookieConsent.acceptRequiredOnly') }}
        </DgaButton>
        <!-- <DgaButton theme="hollow" @click="emit('manage')">Manage Cookies</DgaButton> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "acceptAll") : void
  (e: "acceptRequired") : void
  (e: "manage") : void
}>()

</script>