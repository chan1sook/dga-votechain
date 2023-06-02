<template>
  <nav class="dga-nav">
    <img src="~/assets/images/logo_dga.png" class="h-8 lg:h-12" />
    <NuxtLink :href="localePathOf('/')" class="dga-menu-item">{{ $t("navbar.home") }}</NuxtLink>
    <NuxtLink :href="localePathOf('/topics')" class="dga-menu-item">{{ $t("navbar.voting") }}</NuxtLink>
    <NuxtLink :href="localePathOf('/about')" class="dga-menu-item">{{ $t("navbar.about") }}</NuxtLink>
    <NuxtLink :href="localePathOf('/help')" class="dga-menu-item">{{ $t("navbar.help") }}</NuxtLink>
    <NuxtLink :href="localePathOf('/contact-us')" class="dga-menu-item">{{ $t("navbar.contactUs") }}</NuxtLink>
    <NuxtLink v-if="isAdminRole(roleMode)" :href="localePathOf('/admin/users')" class="dga-menu-item">{{ $t('navbar.adminShowUsers') }}</NuxtLink>
    <NuxtLink v-if="roleMode === 'developer'" :href="localePathOf('/admin/blockchain')" class="dga-menu-item">{{ $t('navbar.blockchain') }}</NuxtLink>
    
    <div class="inline-flex ml-auto flex-row items-center gap-4">
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
        <DgaUserDropdown class="!hidden sm:!inline-flex"></DgaUserDropdown>
      </template>
    </div>

    <div class="inline-flex lg:hidden">
      <MenuIcon class="cursor-pointer" @click.stop="toggleShowOption" />
    </div>
    <div v-if="showOption" class="collasped-menu">
      <NuxtLink :href="localePathOf('/')" class="dga-menu-item-small">{{ $t("navbar.home") }}</NuxtLink>
      <NuxtLink :href="localePathOf('/topics')" class="dga-menu-item-small">{{ $t("navbar.voting") }}</NuxtLink>
      <NuxtLink :href="localePathOf('/about')" class="dga-menu-item-small">{{ $t("navbar.about") }}</NuxtLink>
      <NuxtLink :href="localePathOf('/help')" class="dga-menu-item-small">{{ $t("navbar.help") }}</NuxtLink>
      <NuxtLink :href="localePathOf('/contact-us')" class="dga-menu-item-small">{{ $t("navbar.contactUs") }}</NuxtLink>
      <NuxtLink v-if="isAdminRole(roleMode)" :href="localePathOf('/admin/users')" class="dga-menu-item-small">{{ $t('navbar.adminShowUsers') }}</NuxtLink>
      <NuxtLink v-if="roleMode === 'developer'" :href="localePathOf('/admin/blockchain')" class="dga-menu-item-small">{{ $t('navbar.blockchain')}}</NuxtLink>
      <div class="border-t my-1"></div>
      <div class="dga-menu-item-small" @click="toggleLang">{{ $t('navbar.language') }}: {{ prettyLocaleCode  }}</div>
      <NuxtLink v-if="!isLogin" :href="localePathOf('/login')" class="dga-menu-item-small">{{ $t('navbar.login') }}</NuxtLink>
      <template v-if="isLogin">
        <div class="border-t my-1"></div>
        <DgaUserSmallSection class="lg:hidden"></DgaUserSmallSection>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import MenuIcon from 'vue-material-design-icons/Menu.vue';
import { isAdminRole } from '~/src/services/validations/role';

const i18n = useI18n();
const localePathOf = useLocalePath();
const prettyLocaleCode = computed(() => {
  const lang = i18n.locale.value;
  lang.replace(/-*$/, "");
  return lang.toUpperCase();
});
const isLogin = computed(() => useSessionData().value.userid);
const roleMode = computed(() => useSessionData().value.roleMode);
const showOption = computed(() => useVisibleMenuGroup().value === 'main');

async function toggleShowOption() {
  if(!showOption.value) {
    useVisibleMenuGroup().value = 'main';
  } else {
    useVisibleMenuGroup().value = undefined;
  }
}

function toggleLang() {
  if(i18n.locale.value === "th") {
    i18n.setLocale("en");
  } else {
    i18n.setLocale("th");
  }
}

function hideMenu() {
  useVisibleMenuGroup().value = undefined;
}

onMounted(() => {
  document.body.addEventListener("click", hideMenu);
});
onUnmounted(() => {
  document.body.removeEventListener("click", hideMenu);
});
</script>

<style scoped>
.dga-nav {
  @apply transition duration-200 bg-white sticky top-0 h-16 lg:h-20 border border-gray-500/25 shadow flex 
    flex-row items-center p-4 gap-4 select-none hover:shadow-md z-[100];
}
.dga-nav .dga-menu-item {
  @apply hidden lg:block transition duration-100 cursor-pointer px-2 pt-1 pb-2 border-b-4 border-transparent font-bold whitespace-nowrap hover:text-dga-orange;
}
.dga-nav .dga-menu-item.router-link-exact-active {
  @apply text-dga-orange
}

.dga-nav .collasped-menu {
  @apply lg:hidden flex flex-col absolute left-0 right-0 top-16 bg-white shadow overflow-y-auto;
}
.dga-nav .collasped-menu > .dga-menu-item-small {
  @apply transition duration-100 cursor-pointer text-center text-sm px-2 py-1 border-b-4 border-transparent font-bold whitespace-nowrap hover:text-dga-orange;
}

.dga-small-btn {
  @apply inline-flex rounded-full border-2 border-dga-blue w-8 h-8 items-center justify-center overflow-hidden
}

</style>