<template>
  <div>
    <DgaHead>{{ $t('app.userInfoEdit.title') }}</DgaHead>
    <div class="grid grid-cols-12 gap-4 max-w-4xl mx-auto my-4">
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.firstName') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userEditFormData.firstName" class="w-full" :placeholder="$t('app.firstName')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.lastName') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userEditFormData.lastName" class="w-full" :placeholder="$t('app.lastName')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.email') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userEditFormData.email" class="w-full" :placeholder="$t('app.email')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.citizenid') }}
      </div>
      <div class="col-span-12 md:col-span-9 flex flex-col gap-y-1">
        <DgaInput v-model="userEditFormData.citizenid" class="w-full" :placeholder="$t('app.citizenid')"></DgaInput>
        <div v-if="hasCitizenId" class="text-sm">
          {{ $t('app.userInfoEdit.typeToEdit') }}
        </div>
      </div>
      <div class="col-span-12">
        <DgaCheckbox v-model="userEditFormData.isGovOfficer" /> {{ $t('app.userInfoEdit.isGovOfficer') }}
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.ministry') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userEditFormData.ministry" :disabled="!userEditFormData.isGovOfficer" class="w-full" :placeholder="$t('app.ministry')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.department') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userEditFormData.department" :disabled="!userEditFormData.isGovOfficer"  class="w-full" :placeholder="$t('app.department')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.division') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userEditFormData.division" :disabled="!userEditFormData.isGovOfficer"  class="w-full" :placeholder="$t('app.division')"></DgaInput>
      </div>
      <DgaButtonGroup class="col-span-12 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('app.edit')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <PencilIcon />
          <span class="truncate">{{ $t('app.edit') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="editUserInfo"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('app.userInfoEdit.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import PencilIcon from 'vue-material-design-icons/Pencil.vue';

import { isThaiCitizenId } from '~~/src/utils/utils';

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-voter"]
})

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('app.userInfoEdit.title')}`
});

const hasCitizenId = computed(() => useSessionData().value.hasCitizenId === true);

const userEditFormData : Ref<UserEditFormData> = ref({
  firstName: useSessionData().value.firstName || "",
  lastName: useSessionData().value.lastName || "",
  email: useSessionData().value.email || "",
  citizenid: "",
  isGovOfficer: useSessionData().value.isGovOfficer || false,
  ministry: useSessionData().value.ministry || "",
  department: useSessionData().value.department || "",
  division: useSessionData().value.division || "",
});

const showConfirmModal = ref(false);
const waitEdit = ref(false);

function isUserDataValid(userData: UserEditFormData) {
  return userData.firstName !== "" && 
    userData.lastName !== "" &&
    (userData.citizenid !== "" ? isThaiCitizenId(userData.citizenid) : hasCitizenId.value) &&
    (userData.isGovOfficer ? (userData.ministry !== "" && userData.department !== "" && userData.division !== "") : true);
}
const isFormValid = computed(() => isUserDataValid(userEditFormData.value));

async function editUserInfo() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitEdit.value = true;

  const { error } = await useFetch("/api/user/edit", {
    method: "POST",
    body: userEditFormData.value,
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('app.userInfoEdit.title'),
      content: i18n.t('app.userInfoEdit.failed'),
      autoCloseDelay: 5000,
    });
  
    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t('app.userInfoEdit.title'),
      content: i18n.t('app.userInfoEdit.success') ,
      autoCloseDelay: 5000,
    });

    navigateTo(localePathOf("/"))
  }
}
</script>