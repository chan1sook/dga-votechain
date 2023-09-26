<template>
  <div
    class="fixed bottom-0 right-0 max-w-xl rounded-lg bg-white px-4 py-2 shadow-md md:bottom-4 md:right-4"
  >
    <div class="flex flex-col items-center gap-4">
      <div>{{ $t("cookieConsent.useCookie") }}</div>
      <div class="flex flex-row flex-wrap gap-2">
        <div>{{ $t("cookieConsent.useCookieInfo1") }}</div>
        <div>{{ $t("cookieConsent.useCookieInfo2") }}</div>
        <NuxtLink href="/privacy-policy" class="underline">{{
          $t("app.privacyPolicy")
        }}</NuxtLink>
        <NuxtLink href="/cookie-policy" class="underline">{{
          $t("app.cookiePolicy")
        }}</NuxtLink>
      </div>
      <div
        class="mx-auto flex w-full flex-col gap-2 text-sm sm:w-auto sm:flex-row"
      >
        <DgaButton @click="emit('acceptAll')">
          {{ $t("cookieConsent.acceptAll") }}
        </DgaButton>
        <DgaButton theme="hollow" @click="emit('acceptRequired')">
          {{ $t("cookieConsent.acceptRequiredOnly") }}
        </DgaButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "acceptAll"): void;
  (e: "acceptRequired"): void;
  (e: "manage"): void;
}>();
</script>
