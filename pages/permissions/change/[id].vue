<template>
  <div v-if="userData">
    <DgaHead>{{ $t('requestPermissions.change.title') }}</DgaHead>
    <div>
      <div class="flex flex-col sm:flex-row gap-2 my-2">
        <div class="flex-1"> 
          <span v-if="userNameOf(userData)">{{ userNameOf(userData) }}</span>
          <span class="italic" v-else>{{ $t("navbar.user.anonymous") }}</span>
        </div>
        <div class="flex-1"> 
          <span class="font-bold"></span>{{ $t('requestPermissions.email') }}: 
          <template v-if="userData.email">{{ userData.email }}</template>
          <span class="italic" v-else>-</span>
        </div>
      </div>
      <h4 class="my-2 font-bold">{{ getFullPermissionTitle("change-permissions:basic") }}</h4>
      <div v-for="permission of getBasicPermissions()" class="flex flex-row gap-2 my-2">
        <DgaCheckbox v-model="userData.permissions" :value="permission" :disabled="notSelfForbiddenPermissions.includes(permission) && isEditSelf"></DgaCheckbox>
        <span>{{ getFullPermissionTitle(permission) }}</span>
      </div>
      <template v-if="isDeveloper">
        <h4 class="my-2 font-bold">{{ getFullPermissionTitle("change-permissions:advance") }}</h4>
        <div v-for="permission of removePermissions(getAdvancePermissions(), 'create-news', 'change-news')" class="flex flex-row gap-2 my-2">
          <DgaCheckbox v-model="userData.permissions" :value="permission" :disabled="notSelfForbiddenPermissions.includes(permission) && isEditSelf"></DgaCheckbox>
          <span>{{ getFullPermissionTitle(permission) }}</span>
        </div>
      </template>
      <div class="flex flex-row justify-center">
        <DgaButton class="w-full sm:w-auto" color="dga-orange" @click="showConfirmModal = true">{{ $t('requestPermissions.change.action') }}</DgaButton>
      </div>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="changePermissions"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('requestPermissions.change.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="isWaitAction">
    </DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import { getBasicPermissions, getAdvancePermissions, removePermissions, getNotSelfEditablePermissions } from '~~/src/utils/permissions';

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('requestPermissions.change.title')}`
});

function getFullPermissionTitle(permission: EVotePermission) {
  return i18n.t(`permissions.${permission}`, permission);
}

const { id: userid } = useRoute().params;
const { data } = await useFetch(`/api/user/info/${userid}`);

const userData : Ref<UserPermissionsResponseData | undefined> = ref(undefined);
const isWaitAction = ref(false);
const showConfirmModal = ref(false);

const isEditSelf = computed(() => useSessionData().value.userid === userid);

if (!data.value) {
  showError("Can't get Request Permissions List");
} else {
  userData.value = data.value;
}

const isDeveloper = computed(() => useSessionData().value.roleMode === "developer");

function userNameOf(userData: UserPermissionsResponseData) {
  let name = "";
  if(userData.firstName) {
    name = userData.firstName;
    if(userData.lastName) {
      name += " " + userData.lastName;
    }
  }
  return name;
}

const notSelfForbiddenPermissions : Array<EVotePermission> = getNotSelfEditablePermissions();

async function changePermissions() {
  if(!userData.value) {
    return;
  }

  isWaitAction.value = true;

  await useFetch(`/api/permissions/change/${userid}`, {
    method: "POST",
    body: {
      permissions: userData.value.permissions
    }
  })
  
  const { error } = await useFetch("/api/permissions/request/lists");
  
  if(error.value) {
    useShowToast({
      title: i18n.t('requestPermissions.change.action'),
      content: i18n.t('requestPermissions.change.failed'),
      autoCloseDelay: 5000,
    });
  } else {
    useShowToast({
      title: i18n.t('requestPermissions.change.action'),
      content: i18n.t('requestPermissions.change.success') ,
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/admin/users"))
  }

  isWaitAction.value = false;
}
</script>

<style scoped>
</style>