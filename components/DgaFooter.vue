<template>
  <div>
    <div class="dga-footer">Power by Digital Government Development Agency (Public Organization) (DGA) </div>
    <div class="dga-footer-about">
      <img src="~/assets/images/logo_dga.png" class="block h-8 md:h-12" />
      <div class="flex flex-row flex-wrap gap-x-2 gap-y-1 justify-center">
        <div>{{ $t('contactUs.info.address1') }}</div>
        <div>{{ $t('contactUs.info.address2') }}</div>
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
  </div>
</template>

<style scoped>
.dga-footer-about {
  @apply bg-gray-100 text-center px-4 py-4 text-xs md:text-sm flex flex-row gap-x-8 justify-center items-center
}
.dga-footer {
  @apply bg-gray-50 text-center px-4 py-4 text-xs md:text-sm font-bold
}
</style>