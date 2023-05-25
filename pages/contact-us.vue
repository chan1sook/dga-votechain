<template>
  <div>
    <DgaHead>{{ $t('contactUs.title') }}</DgaHead>
    <div class="my-4 flex flex-col gap-1">
      <div>
        {{ $t('contactUs.info.address1') }}
      </div>
      <div>
        {{ $t('contactUs.info.address2') }}
      </div>
      <div>
        {{ $t('contactUs.info.tels') }} <a href="tel:+6626126011-12">(+66) 02 612 6011-12</a>
      </div>
      <div>
        {{ $t('contactUs.info.email') }} <a href="mailto:contact@dga.or.th">contact@dga.or.th</a>
      </div>
      <div>
        {{ $t('contactUs.info.contactCenter') }} <a href="tel:+6626126060">(+66) 02 612 6060</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n()

definePageMeta({
  middleware: ["auth"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('contactUs.title')}`
});


</script>