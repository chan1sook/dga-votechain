<template>
  <div>
    <div class="flex flex-col gap-2">
      <DgaHead>{{ $t("app.preferences.title") }}</DgaHead>
      <DgaTab
        v-model="currentTab"
        :tabs="{
          userInfo: $t('app.preferences.userInfo'),
          topMenu: $t('app.preferences.topMenu.title'),
        }"
      ></DgaTab>
      <DgaPreferencesUserInfo
        v-if="currentTab === 'userInfo'"
        v-model="userPreferences.userInfo"
        class="mx-auto my-4 w-full max-w-4xl"
      >
      </DgaPreferencesUserInfo>
      <DgaPreferencesTopMenu
        v-if="currentTab === 'topMenu'"
        class="mx-auto my-4 w-full max-w-4xl"
        v-model="userPreferences.topMenu"
      >
      </DgaPreferencesTopMenu>
      <DgaButtonGroup class="mt-4">
        <DgaButton
          class="!flex flex-row items-center justify-center gap-x-2 truncate"
          color="dga-orange"
          :title="$t('app.preferences.action')"
          :disabled="!isFormValid"
          @click="showConfirmModal = true"
        >
          <PencilIcon />
          <span class="truncate">{{ $t("app.preferences.action") }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal
      :show="showConfirmModal"
      cancel-backdrop
      @confirm="editPref"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t("app.preferences.confirm") }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import PencilIcon from "vue-material-design-icons/Pencil.vue";

import {
  getDefaultAdminTopMenus,
  getDefaultDevTopMenus,
  getDefaultTopMenus,
} from "~/src/services/form/preference";
import { isUserAdmin, isUserDeveloper } from "~/src/services/validations/role";

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-voter"],
});

useHead({
  title: `${i18n.t("appName")} - ${i18n.t("app.preferences.title")}`,
});

const userPreferences: Ref<UserPreferencesForm> = ref({
  userInfo: {
    firstName: useSessionData().value.firstName || "",
    lastName: useSessionData().value.lastName || "",
    email: useSessionData().value.email || "",
    isGovOfficer: useSessionData().value.isGovOfficer || false,
    ministry: useSessionData().value.ministry || "",
    department: useSessionData().value.department || "",
    division: useSessionData().value.division || "",
  },
  topMenu: getDefaultTopMenus(),
});

if (Array.isArray(useSessionData().value.preferences.topMenu)) {
  userPreferences.value.topMenu =
    useSessionData().value.preferences.topMenu.slice();
} else {
  const _permissions = useSessionData().value.permissions;
  if (isUserDeveloper({ permissions: _permissions })) {
    userPreferences.value.topMenu = getDefaultDevTopMenus();
  } else if (isUserAdmin({ permissions: _permissions })) {
    userPreferences.value.topMenu = getDefaultAdminTopMenus();
  }
}

const currentTab = ref("userInfo");
const showConfirmModal = ref(false);
const waitEdit = ref(false);

function isUserDataValid(userData: UserEditFormData) {
  return userData.isGovOfficer
    ? userData.ministry !== "" &&
        userData.department !== "" &&
        userData.division !== ""
    : true;
}
const isFormValid = computed(() =>
  isUserDataValid(userPreferences.value.userInfo)
);

async function editPref() {
  if (!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitEdit.value = true;

  const { error } = await useFetch("/api/user/edit-pref", {
    method: "POST",
    body: {
      userInfo: {
        ...userPreferences.value.userInfo,
        firstName: undefined,
        lastName: undefined,
      },
      topMenu: userPreferences.value.topMenu,
    },
  });

  if (error.value) {
    useShowToast({
      title: i18n.t("app.preferences.title"),
      content: i18n.t("app.preferences.failed"),
      autoCloseDelay: 5000,
    });

    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t("app.preferences.title"),
      content: i18n.t("app.preferences.success"),
      autoCloseDelay: 5000,
    });

    navigateTo(localePathOf("/"));
  }
}
</script>

<style scoped>
.dga-tab {
  @apply flex select-none flex-row items-center gap-4 transition duration-200;
}
.dga-tab .dga-tab-item {
  @apply cursor-pointer whitespace-nowrap border-b-4 border-transparent px-2 pb-2 pt-1 font-bold transition duration-100 hover:text-dga-orange;
}
.dga-tab .dga-tab-item.is-active {
  @apply border-b-[3px] border-dga-orange text-dga-orange;
}
</style>
