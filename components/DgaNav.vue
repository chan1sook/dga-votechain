<template>
  <nav class="dga-nav">
    <img src="~/assets/images/logo_dga.png" class="h-8 lg:h-12" />
    <template v-for="menu of currentTopMenus">
      <NuxtLink v-if="menu === 'home'" :href="localePathOf('/')" class="dga-menu-item">{{ $t("app.home.title") }}</NuxtLink>
      <NuxtLink v-else-if="menu === 'voting'" :href="localePathOf('/topics')" class="dga-menu-item">{{ $t("app.voting.title") }}</NuxtLink>
      <NuxtLink v-else-if="menu === 'about'" :href="localePathOf('/about')" class="dga-menu-item">{{ $t("app.about.title") }}</NuxtLink>
      <NuxtLink v-else-if="menu === 'help'" :href="localePathOf('/help')" class="dga-menu-item">{{ $t("app.help.title") }}</NuxtLink>
      <NuxtLink v-else-if="menu === 'contact-us'" :href="localePathOf('/contact-us')" class="dga-menu-item">{{ $t("app.contactUs.title") }}</NuxtLink>
      <NuxtLink v-else-if="menu === 'users-management'" :href="localePathOf('/admin/users')" class="dga-menu-item">{{ $t('app.navbar.adminShowUsers') }}</NuxtLink>
      <NuxtLink v-else-if="menu === 'blockchain'" :href="localePathOf('/admin/blockchain')" class="dga-menu-item">{{ $t('app.navbar.blockchain') }}</NuxtLink>
      <NuxtLink v-else-if="menu === 'server-config'" :href="localePathOf('/admin/config')" class="dga-menu-item">{{ $t('app.admin.config.title') }}</NuxtLink>
    </template>
    <div class="inline-flex ml-auto flex-row items-center gap-4">
      <button type="button" class="dga-small-btn" @click="toggleLang">
        {{ prettyLocaleCode }}
      </button>    
      <template v-if="isLogin">
        <DgaNewsDropdown></DgaNewsDropdown>
        <DgaNotifyDropdown></DgaNotifyDropdown>
      </template>
      <DgaUserDropdown></DgaUserDropdown>
    </div>
    <div class="inline-flex lg:hidden">
      <MenuIcon class="cursor-pointer" @click.stop="toggleShowMenuOption" />
    </div>
    <div v-if="showMenuOption" class="collasped-menu lg:hidden px-4 py-2" @click.stop>
      <template v-for="menu of currentTopMenus">
        <NuxtLink v-if="menu === 'home'" :href="localePathOf('/')" class="dga-menu-item-small">{{ $t("app.home.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'voting'" :href="localePathOf('/topics')" class="dga-menu-item-small">{{ $t("app.voting.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'about'" :href="localePathOf('/about')" class="dga-menu-item-small">{{ $t("app.about.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'help'" :href="localePathOf('/help')" class="dga-menu-item-small">{{ $t("app.help.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'contact-us'" :href="localePathOf('/contact-us')" class="dga-menu-item-small">{{ $t("app.contactUs.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'users-management'"  :href="localePathOf('/admin/users')" class="dga-menu-item-small">{{ $t('app.navbar.adminShowUsers') }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'blockchain'" :href="localePathOf('/admin/blockchain')" class="dga-menu-item-small">{{ $t('app.navbar.blockchain')}}</NuxtLink>
        <NuxtLink v-else-if="menu === 'server-config'" :href="localePathOf('/admin/config')" class="dga-menu-item-small">{{ $t('app.admin.config.title')}}</NuxtLink>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import MenuIcon from 'vue-material-design-icons/Menu.vue';
import { getDefaultAdminTopMenus, getDefaultDevTopMenus, getDefaultTopMenus } from '~/src/services/form/preference';
import { checkPermissionNeeds } from '~/src/services/validations/permission';

const i18n = useI18n();
const localePathOf = useLocalePath();
const prettyLocaleCode = computed(() => {
  const lang = i18n.locale.value;
  lang.replace(/-*$/, "");
  return lang.toUpperCase();
});
const isLogin = computed(() => useSessionData().value.userid);
const showMenuOption = computed(() => useVisibleMenuGroup().value === 'menu');

const currentTopMenus = computed(() => {
  if(Array.isArray(useSessionData().value.preferences.topMenu)) {
    return useSessionData().value.preferences.topMenu;
  }

  const _permissions = useSessionData().value.permissions;
  if(checkPermissionNeeds(_permissions, "dev-mode")) {
    return getDefaultDevTopMenus();
  } else if(checkPermissionNeeds(_permissions, "admin-mode")) {
    return getDefaultAdminTopMenus();
  }
  return getDefaultTopMenus();
})

async function toggleShowMenuOption() {
  if(!showMenuOption.value) {
    useVisibleMenuGroup().value = 'menu';
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
  @apply flex flex-col absolute left-0 right-0 top-16 bg-white shadow;
}
.dga-nav .collasped-menu > .dga-menu-item-small {
  @apply lg:hidden transition duration-100 cursor-pointer text-center text-sm px-2 py-1 border-b-4 border-transparent font-bold whitespace-nowrap hover:text-dga-orange;
}

.dga-small-btn {
  @apply inline-flex rounded-full border-2 border-dga-blue w-8 h-8 items-center justify-center overflow-hidden
}

</style>