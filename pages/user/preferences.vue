<template>
  <div>
    <div class="flex flex-col gap-2">
      <DgaHead>{{ $t('app.preferences.title') }}</DgaHead>
      <DgaTab v-model="currentTab" :tabs="{
        userInfo: $t('app.preferences.userInfo'),
        topMenu: $t('app.preferences.topMenu.title'),
      }"></DgaTab>
      <DgaPreferencesUserInfo v-if="currentTab === 'userInfo'" 
        v-model="userPreferences.userInfo"
        class="w-full max-w-4xl mx-auto my-4"
      >
      </DgaPreferencesUserInfo>
      <DgaPreferencesTopMenu v-if="currentTab === 'topMenu'" 
        class="w-full max-w-4xl mx-auto my-4"
        v-model="userPreferences.topMenu"
      >
      </DgaPreferencesTopMenu>
      <DgaButtonGroup class="mt-4">
      <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
        color="dga-orange" :title="$t('app.preferences.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
      >
        <PencilIcon />
        <span class="truncate">{{ $t('app.preferences.action') }}</span>
      </DgaButton>
    </DgaButtonGroup>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="editPref"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('app.preferences.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import PencilIcon from 'vue-material-design-icons/Pencil.vue';

import { getDefaultAdminTopMenus, getDefaultDevTopMenus, getDefaultTopMenus } from '~/src/services/form/preference';
import { checkPermissionNeeds } from '~/src/services/validations/permission';

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-voter"]
})

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('app.preferences.title')}`
});

const userPreferences : Ref<UserPreferencesForm> = ref({
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

if(Array.isArray(useSessionData().value.preferences.topMenu)) {
  userPreferences.value.topMenu = useSessionData().value.preferences.topMenu.slice();
} else {
  const _permissions = useSessionData().value.permissions;
  if(checkPermissionNeeds(_permissions, "dev-mode")) {
    userPreferences.value.topMenu = getDefaultDevTopMenus();
  } else if(checkPermissionNeeds(_permissions, "admin-mode")) {
    userPreferences.value.topMenu = getDefaultAdminTopMenus();
  }
}

const currentTab = ref("userInfo");
const showConfirmModal = ref(false);
const waitEdit = ref(false);

function isUserDataValid(userData: UserEditFormData) {
  return (userData.isGovOfficer ? (userData.ministry !== "" && userData.department !== "" && userData.division !== "") : true);
}
const isFormValid = computed(() => isUserDataValid(userPreferences.value.userInfo));

async function editPref() {
  if(!isFormValid.value) {
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

  if(error.value) {
    useShowToast({
      title: i18n.t('app.preferences.title'),
      content: i18n.t('app.preferences.failed'),
      autoCloseDelay: 5000,
    });
  
    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t('app.preferences.title'),
      content: i18n.t('app.preferences.success') ,
      autoCloseDelay: 5000,
    });

    navigateTo(localePathOf("/"))
  }
}
</script>

<style scoped>
.dga-tab {
  @apply transition duration-200 flex flex-row items-center gap-4 select-none;
}
.dga-tab .dga-tab-item {
  @apply transition duration-100 cursor-pointer px-2 pt-1 pb-2 border-b-4 border-transparent font-bold whitespace-nowrap hover:text-dga-orange;
}
.dga-tab .dga-tab-item.is-active {
  @apply border-b-[3px] border-dga-orange text-dga-orange
}
</style>