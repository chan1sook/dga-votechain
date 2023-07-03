<template>
  <div>
    <div v-if="isOfflineMode" class="text-sm px-2 py-1 bg-red-700 text-white text-center">
      {{ $t('app.offlineMode') }} {{ formatDateTime(offlineStart) }} - {{ formatDateTime(offlineEnd) }}
    </div>
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
            <NuxtLink href="#" class="underline">{{ $t('app.sendFeedback') }}</NuxtLink> |   
            <NuxtLink href="#" class="underline">{{ $t('app.termCondition') }}</NuxtLink> |
            <NuxtLink href="/privacy-policy" class="underline">{{ $t('app.privacyPolicy') }}</NuxtLink>
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

<script setup lang="ts">
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import 'dayjs/locale/en';
import 'dayjs/locale/th';
import { thaiLocalTimeToGMT } from '~/src/services/transform/localtime';

dayjs.extend(buddhistEra);

const i18n = useI18n();

const offlineStart = ref(thaiLocalTimeToGMT(2023, 5, 30, 18, 0))
const offlineEnd = ref(thaiLocalTimeToGMT(2023, 6, 3, 0, 0))

const todayTime = ref(Date.now());
const isOfflineMode = ref(false);

function updateTime() {
  todayTime.value = useComputedServerTime().getTime();
  isOfflineMode.value = dayjs(offlineStart.value).diff(Date.now()) < 0 && dayjs(offlineEnd.value).diff(Date.now()) > 0;
}

function formatDateTime(date: Date) {
  if(i18n.locale.value === 'th') {
    return dayjs(date).locale(i18n.locale.value).format("D MMMM BBBB HH:mm") + " น."
  }

  return dayjs(date).locale(i18n.locale.value).format("D MMMM YYYY HH:mm")
}

let timeId: NodeJS.Timer | undefined;
onMounted(() => {
  timeId = setInterval(updateTime, 500);
  updateTime();
})

onUnmounted(() => {
  clearInterval(timeId);
})
</script>

<style scoped>
.dga-footer-about {
  @apply bg-dga-blue text-white px-2 py-2 text-[0.64rem] md:text-xs flex flex-row gap-x-8 justify-center items-center
}
</style>