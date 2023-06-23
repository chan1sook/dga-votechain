<template>
  <div>
    <div class="dga-footer-about">
      <img src="~/assets/images/logo_dga_c.png" class="block h-8 md:h-12" />
      <div class="flex-1 grid grid-cols-12 gap-x-2 gap-y-1">
        <div class="col-span-12 lg:col-span-7">
          <div>สำนักงานพัฒนารัฐบาลดิจิทัล (องค์การมหาชน) (สพร.)</div>
          <div>Digital Government Development Agency (Public Organization) (DGA)</div>
          <div>All right reserved 2015. Digital Government Development Agency (Public Organization) (DGA)</div>
        </div>
        <div class="col-span-12 lg:col-span-5 lg:text-right">
          <div>
            <NuxtLink href="#" class="underline">ส่งข้อเสนอแนะ</NuxtLink> |   
            <NuxtLink href="#" class="underline">เงื่อนไขและข้อตกลง</NuxtLink> |
            <NuxtLink href="/private-policy" class="underline">ความเป็นส่วนตัว</NuxtLink>
          </div>
          <div>
            {{ $t('contactUs.info.contactCenter') }} <a href="tel:+6626126060">(+66) 02 612 6060</a>
          </div>
          <div>
            {{ $t('contactUs.info.email') }} <a href="mailto:contact@dga.or.th">contact@dga.or.th</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dga-footer-about {
  @apply bg-dga-blue text-white px-4 py-4 text-xs md:text-sm flex flex-row gap-x-8 justify-center items-center
}
</style>