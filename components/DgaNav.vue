<template>
  <nav class="dga-nav">
    <img src="~/assets/images/logo_dga.png" class="h-8 lg:h-12" />
    <div class="flex flex-row gap-2 overflow-hidden">
      <div v-for="menu of currentTopMenus">
        <NuxtLink
          v-if="menu === 'home'"
          :href="localePathOf('/')"
          class="dga-menu-item"
          >{{ $t("app.home.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'voting'"
          :href="localePathOf('/topics')"
          class="dga-menu-item"
          >{{ $t("app.voting.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'about'"
          :href="localePathOf('/about')"
          class="dga-menu-item"
          >{{ $t("app.about.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'help'"
          :href="localePathOf('/help')"
          class="dga-menu-item"
          >{{ $t("app.help.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'contact-us'"
          :href="localePathOf('/contact-us')"
          class="dga-menu-item"
          >{{ $t("app.contactUs.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'users-management'"
          :href="localePathOf('/admin/users')"
          class="dga-menu-item"
          >{{ $t("app.navbar.adminShowUsers") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'blockchain'"
          :href="localePathOf('/admin/blockchain')"
          class="dga-menu-item"
          >{{ $t("app.navbar.blockchain") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'server-config'"
          :href="localePathOf('/admin/config')"
          class="dga-menu-item"
          >{{ $t("app.admin.config.title") }}</NuxtLink
        >
      </div>
    </div>
    <div class="ml-auto inline-flex flex-row items-center gap-4">
      <div class="hidden flex-row gap-2 xl:flex">
        <DgaButton
          v-if="isAdmin || isDeveloper"
          color="dga-orange"
          :theme="roleMode !== 'voter' ? 'hollow' : undefined"
          class="whitespace-nowrap !py-1 !text-sm"
          :title="switchRoleStrOf('voter')"
          @click="switchRoleMode('voter')"
        >
          {{ $t("app.role.voter") }}
        </DgaButton>
        <DgaButton
          v-if="isAdmin"
          color="dga-orange"
          :theme="roleMode !== 'admin' ? 'hollow' : undefined"
          class="whitespace-nowrap !py-1 !text-sm"
          :title="switchRoleStrOf('admin')"
          @click="switchRoleMode('admin')"
        >
          {{ $t("app.role.admin") }}
        </DgaButton>
        <DgaButton
          v-if="isDeveloper"
          color="dga-orange"
          :theme="roleMode !== 'developer' ? 'hollow' : undefined"
          class="whitespace-nowrap !py-1 !text-sm"
          :title="switchRoleStrOf('developer')"
          @click="switchRoleMode('developer')"
        >
          {{ $t("app.role.developer") }}
        </DgaButton>
      </div>
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
    <div v-if="showMenuOption" class="collasped-menu px-4 py-2 lg:hidden">
      <template v-for="menu of currentTopMenus">
        <NuxtLink
          v-if="menu === 'home'"
          :href="localePathOf('/')"
          class="dga-menu-item-small"
          >{{ $t("app.home.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'voting'"
          :href="localePathOf('/topics')"
          class="dga-menu-item-small"
          >{{ $t("app.voting.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'about'"
          :href="localePathOf('/about')"
          class="dga-menu-item-small"
          >{{ $t("app.about.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'help'"
          :href="localePathOf('/help')"
          class="dga-menu-item-small"
          >{{ $t("app.help.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'contact-us'"
          :href="localePathOf('/contact-us')"
          class="dga-menu-item-small"
          >{{ $t("app.contactUs.title") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'users-management'"
          :href="localePathOf('/admin/users')"
          class="dga-menu-item-small"
          >{{ $t("app.navbar.adminShowUsers") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'blockchain'"
          :href="localePathOf('/admin/blockchain')"
          class="dga-menu-item-small"
          >{{ $t("app.navbar.blockchain") }}</NuxtLink
        >
        <NuxtLink
          v-else-if="menu === 'server-config'"
          :href="localePathOf('/admin/config')"
          class="dga-menu-item-small"
          >{{ $t("app.admin.config.title") }}</NuxtLink
        >
      </template>
    </div>
    <DgaLoadingModal :show="waitSwap"></DgaLoadingModal>
  </nav>
</template>

<script setup lang="ts">
import MenuIcon from "vue-material-design-icons/Menu.vue";
import {
  getDefaultAdminTopMenus,
  getDefaultDevTopMenus,
  getDefaultVoterTopMenus,
  getDefaultTopMenus,
} from "~/src/services/form/preference";
import { checkPermissionNeeds } from "~/src/services/validations/permission";

const i18n = useI18n();
const localePathOf = useLocalePath();
const prettyLocaleCode = computed(() => {
  const lang = i18n.locale.value;
  lang.replace(/-*$/, "");
  return lang.toUpperCase();
});
const isLogin = computed(() => useSessionData().value.userid);
const isDeveloper = computed(() =>
  checkPermissionNeeds(useSessionData().value.permissions, "dev-mode")
);
const isAdmin = computed(() =>
  checkPermissionNeeds(useSessionData().value.permissions, "admin-mode")
);
const showMenuOption = computed(() => useVisibleMenuGroup().value === "menu");

const currentTopMenus = computed(() => {
  if (Array.isArray(useSessionData().value.preferences.topMenu)) {
    return useSessionData().value.preferences.topMenu;
  }

  const _permissions = useSessionData().value.permissions;
  if (checkPermissionNeeds(_permissions, "dev-mode")) {
    return getDefaultDevTopMenus();
  } else if (checkPermissionNeeds(_permissions, "admin-mode")) {
    return getDefaultAdminTopMenus();
  } else if (checkPermissionNeeds(_permissions, "voter-mode")) {
    return getDefaultVoterTopMenus();
  }
  return getDefaultTopMenus();
});

async function toggleShowMenuOption() {
  if (!showMenuOption.value) {
    useVisibleMenuGroup().value = "menu";
  } else {
    useVisibleMenuGroup().value = undefined;
  }
}

function toggleLang() {
  if (i18n.locale.value === "th") {
    i18n.setLocale("en");
  } else {
    i18n.setLocale("th");
  }
}

function hideMenu() {
  useVisibleMenuGroup().value = undefined;
}

const roleMode = computed(() => useSessionData().value.roleMode);
const waitSwap = ref(false);

function switchRoleStrOf(role: UserRole) {
  return `${i18n.t("app.navbar.user.switchRoleMode")} [${i18n.t(
    `app.role.${role}`
  )}]`;
}

async function switchRoleMode(role: UserRole) {
  if (waitSwap.value) {
    return;
  }
  waitSwap.value = true;

  const { data } = await useFetch("/api/session/switch", {
    method: "POST",
    body: { newMode: role },
  });

  if (!useAllowRoles().value.includes(role)) {
    switch (role) {
      case "voter":
      case "admin":
        navigateTo(localePathOf("/topics"));
        break;
      default:
        navigateTo(localePathOf("/"));
        break;
    }
  } else {
    useRouter().go(0);
  }

  useVisibleMenuGroup().value = undefined;
  waitSwap.value = false;
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
  @apply sticky top-0 z-[100] flex h-16 select-none flex-row items-center gap-4 border border-gray-500/25 
    bg-white p-4 shadow transition duration-200 hover:shadow-md lg:h-20;
}
.dga-nav .dga-menu-item {
  @apply hidden cursor-pointer whitespace-nowrap border-b-4 border-transparent px-2 pb-2 pt-1 font-bold transition duration-100 hover:text-dga-orange lg:block;
}
.dga-nav .dga-menu-item.router-link-exact-active {
  @apply text-dga-orange;
}

.dga-nav .collasped-menu {
  @apply absolute left-0 right-0 top-16 flex flex-col bg-white shadow;
}
.dga-nav .collasped-menu > .dga-menu-item-small {
  @apply cursor-pointer whitespace-nowrap border-b-4 border-transparent px-2 py-1 text-center text-sm font-bold transition duration-100 hover:text-dga-orange lg:hidden;
}

.dga-small-btn {
  @apply inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-dga-blue;
}
</style>
