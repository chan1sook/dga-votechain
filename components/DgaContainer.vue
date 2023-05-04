<template>
  <div class="dga-container-root text-dga-blue">
    <nav class="dga-nav top-0">
      <img src="~/assets/images/logo_dga.png" class="h-12" />
      <NuxtLink :href="localePathOf('/')" class="dga-menu-item">{{ $t("navbar.home") }}</NuxtLink>
      <NuxtLink :href="localePathOf('/topics')" class="dga-menu-item">{{ $t("navbar.voting") }}</NuxtLink>
      <NuxtLink :href="localePathOf('/about')" class="dga-menu-item">{{ $t("navbar.about") }}</NuxtLink>
      <NuxtLink :href="localePathOf('/help')" class="dga-menu-item">{{ $t("navbar.help") }}</NuxtLink>
      <NuxtLink :href="localePathOf('/contact-us')" class="dga-menu-item">{{ $t("navbar.contactUs") }}</NuxtLink>
      <NuxtLink v-if="roleMode === 'developer'" :href="localePathOf('/blockchain/admin')" class="dga-menu-item">Blockchain</NuxtLink>

      <div class="ml-auto inline-flex flex-row items-center gap-4">
        <button type="button" class="dga-small-btn" @click="toggleLang">
          {{ prettyLocaleCode }}
        </button>
        <DgaButton v-if="!isLogin" 
          :href="localePathOf('/login')" theme="hollow" class="whitespace-nowrap w-32 text-center"
        >
          {{ $t('navbar.login') }}
        </DgaButton>      
        <template v-else>
          <DgaNewsDropdown></DgaNewsDropdown>
          <DgaNotifyDropdown></DgaNotifyDropdown>
          <DgaUserDropdown></DgaUserDropdown>
        </template>
      </div>
    </nav>
    <div class="dga-container flex-1 relative">
      <slot></slot>
      <div v-if="isShowPermissionsApprover" class="fixed bottom-8 right-8 flex flex-row gap-2 items-center">
        <DgaButton 
          v-if="isShowPermissionsApprover"
          class="flex flex-row gap-2 items-center !px-6 !py-2" color="dga-orange"
          :href="localePathOf('/permissions/approve')"
        >
        <MaterialIcon icon="how_to_reg"></MaterialIcon>
          {{ $t('requestPermissions.approve') }}
        </DgaButton>
      </div>
    </div>
    <div>
      <div class="dga-footer">Power by Digital Government Development Agency (Public Organization) (DGA) </div>
      <div class="dga-footer-about">
        <img src="~/assets/images/logo_dga.png" class="block h-12" />
        <div class="flex flex-row flex-wrap gap-x-2 gap-y-1 text-sm justify-center">
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
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n();
const localePathOf = useLocalePath();
const prettyLocaleCode = computed(() => {
  const lang = i18n.locale.value;
  lang.replace(/-*$/, "");
  return lang.toUpperCase();
});
const isLogin = computed(() => useSessionData().value.userid)
const roleMode = computed(() => useSessionData().value.roleMode);

function toggleLang() {
  if(i18n.locale.value === "th") {
    i18n.setLocale("en");
  } else {
    i18n.setLocale("th");
  }
}
function isRouteAllowShow() {
  return ["/", "/topics", "/about", "/help", "/contract-us"].includes(useRoute().path);
}

const isShowPermissionsApprover = computed(() => {
  if(roleMode.value !== "developer") {
    return false;
  }
  return isRouteAllowShow();
})
</script>

<style scoped>
.dga-container-root {
  @apply min-h-screen flex flex-col
}
.dga-nav {
  @apply transition duration-200 bg-white sticky top-0 h-20 border border-gray-500/25 shadow flex 
    flex-row items-center p-4 gap-4 overflow-hidden select-none hover:shadow-md z-[100];
}
.dga-nav .dga-menu-item {
  @apply transition duration-100 cursor-pointer px-2 pt-1 pb-2 border-b-4 border-transparent font-bold whitespace-nowrap hover:text-dga-orange;
}
.dga-nav .dga-menu-item.router-link-exact-active {
  @apply text-dga-orange
}

.dga-small-btn {
  @apply rounded-full border-2 border-dga-blue w-8 h-8 inline-flex items-center justify-center overflow-hidden
}

.dga-footer-about {
  @apply bg-gray-100 text-center px-4 py-4 text-sm flex flex-row gap-x-8 justify-center items-center
}

.dga-footer-menu {
  @apply flex flex-row overflow-hidden bg-dga-blue text-white
}
.dga-footer-menu .dga-menu-item {
  @apply transition duration-100 px-4 py-2 cursor-pointer text-sm whitespace-nowrap hover:text-gray-200
}
.dga-footer {
  @apply bg-gray-50 text-center px-4 py-4 text-sm font-bold truncate
}
</style>