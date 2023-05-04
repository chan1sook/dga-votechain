<template>
  <div class="fixed bottom-4 right-4 rounded-lg bg-white shadow-md px-4 py-2">
    <div class="flex flex-col gap-4 items-center">
      <div>{{ $t('cookieConsent.useCookie') }}</div>
      <div class="flex flex-row gap-2 text-sm">
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