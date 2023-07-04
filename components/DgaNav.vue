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
    <div class="inline-flex">
      <MenuIcon class="cursor-pointer" @click.stop="toggleShowMenuOption" />
    </div>
    <div v-if="showMenuOption" class="collasped-menu px-4 py-2" @click.stop>
      <template v-for="menu of currentTopMenus">
        <NuxtLink v-if="menu === 'home'" :href="localePathOf('/')" class="dga-menu-item-small">{{ $t("app.home.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'voting'" :href="localePathOf('/topics')" class="dga-menu-item-small">{{ $t("app.voting.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'about'" :href="localePathOf('/about')" class="dga-menu-item-small">{{ $t("app.about.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'help'" :href="localePathOf('/help')" class="dga-menu-item-small">{{ $t("app.help.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'contact-us'" :href="localePathOf('/contact-us')" class="dga-menu-item-small">{{ $t("app.contactUs.title") }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'users-management'"  :href="localePathOf('/admin/users')" class="dga-menu-item-small">{{ $t('app.navbar.adminShowUsers') }}</NuxtLink>
        <NuxtLink v-else-if="menu === 'blockchain'" :href="localePathOf('/admin/blockchain')" class="dga-menu-item-small">{{ $t('app.navbar.blockchain')}}</NuxtLink>
      </template>
      <div class="w-full mx-auto max-w-3xl flex flex-row gap-2 items-center">
        <DgaVueSelect v-model="selectedRoute" class="flex-1 z-[400]" 
          :placeholder="$t('app.navbar.target')" :options="getMenuOptions" :reduce="(ele) => ele.value"
        >
        </DgaVueSelect>
        <DgaButton color="dga-orange" :disabled="!selectedRoute" @click="goToCurrentRoute(selectedRoute)">
          {{ $t('app.navbar.go') }}
        </DgaButton>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import MenuIcon from 'vue-material-design-icons/Menu.vue';
import { getDefaultAdminTopMenus, getDefaultDevTopMenus, getDefaultTopMenus } from '~/src/services/form/preference';

const i18n = useI18n();
const localePathOf = useLocalePath();
const prettyLocaleCode = computed(() => {
  const lang = i18n.locale.value;
  lang.replace(/-*$/, "");
  return lang.toUpperCase();
});
const isLogin = computed(() => useSessionData().value.userid);
const selectedRoute : Ref<PreferenceTopMenuOption | ''> = ref('');
const showMenuOption = computed(() => useVisibleMenuGroup().value === 'menu');

const currentTopMenus = computed(() => {
  switch(useSessionData().value.roleMode) {
    case "voter":
      return useSessionData().value.preferences.topMenu.voter;
    case "admin":
      return useSessionData().value.preferences.topMenu.admin;
    case "developer":
      return useSessionData().value.preferences.topMenu.dev;
    default:
      return getDefaultTopMenus();
  }
})

const getMenuOptions = computed(() => {
  let menu = [];
  switch(useSessionData().value.roleMode) {
    case "voter":
      menu = getDefaultTopMenus();
      break;
    case "admin":
      menu = getDefaultAdminTopMenus();
      break;
    case "developer":
      menu = getDefaultDevTopMenus();
      break;
    default:
      menu = getDefaultTopMenus();
      break;
  }

  return menu.map((ele) => {
    return { label: topMenuPretty(ele), value: ele }
  });
})

function topMenuPretty(menu: PreferenceTopMenuOption) {
  switch(menu) {
    case "home":
      return i18n.t("app.home.title")
    case "voting":
      return i18n.t("app.voting.title")
    case "about":
      return i18n.t("app.about.title")
    case "help":
      return i18n.t("app.help.title")
    case "contact-us":
      return i18n.t("app.contactUs.title")
    case "users-management":
      return i18n.t("app.navbar.adminShowUsers")
    case "blockchain":
      return i18n.t("app.navbar.blockchain")
    case "server-config":
      return i18n.t("app.admin.config.title")
    default:
      return menu;
  }
}

function goToCurrentRoute(menu: PreferenceTopMenuOption | '') {
  switch(menu) {
    case "home":
      return navigateTo("/")
    case "voting":
      return navigateTo("/topics")
    case "about":
      return navigateTo("/about")
    case "help":
      return navigateTo("/help")
    case "contact-us":
      return navigateTo("/contract-us")
    case "users-management":
      return navigateTo("/admin/users")
    case "blockchain":
      return navigateTo("/admin/blockchain")
    case "server-config":
      return navigateTo("/admin/config")
    default:
      break;
  }
}

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