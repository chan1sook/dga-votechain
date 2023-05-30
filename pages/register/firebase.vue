<template>
  <div v-if="token">
    <DgaHead>{{ $t("register.firebase.title") }}</DgaHead>
    <div class="grid grid-cols-12 gap-4 max-w-4xl mx-auto my-4">
      <div class="col-span-12 md:col-span-3">
        {{ $t('register.firebase.token') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput :value="token" disabled class="w-full" :placeholder="$t('register.firebase.token')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.firstName') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userRegisterFormData.firstName" class="w-full" :placeholder="$t('app.firstName')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.lastName') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userRegisterFormData.lastName" class="w-full" :placeholder="$t('app.lastName')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.citizenid') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userRegisterFormData.citizenid" class="w-full" :placeholder="$t('app.citizenid')"></DgaInput>
      </div>
      <template v-if="false">
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.ministry') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userRegisterFormData.ministry" class="w-full" :placeholder="$t('app.ministry')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.department') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userRegisterFormData.department" class="w-full" :placeholder="$t('app.department')"></DgaInput>
      </div>
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.division') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaInput v-model="userRegisterFormData.division" class="w-full" :placeholder="$t('app.division')"></DgaInput>
      </div>
      </template>
      <DgaButtonGroup class="col-span-12 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('register.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <AccountPlusOutlineIcon />
          <span class="truncate">{{ $t('register.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="registerGoogleAccount"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('register.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitCreate"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
interface UserRegisterFormData {
  firstName: string,
  lastName: string,
  citizenid: string,
  ministry: string,
  department: string,
  division: string,
}

import AccountPlusOutlineIcon from 'vue-material-design-icons/AccountPlusOutline.vue';

import { isThaiCitizenId } from '~~/src/utils/utils';

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-guest"]
})
useHead({
  title: `${i18n.t('appName')} - ${i18n.t('register.firebase.title')}`
});

const token = ref(useRoute().query.token);

const userRegisterFormData : Ref<UserRegisterFormData> = ref({
  firstName: "",
  lastName: "",
  citizenid: "",
  ministry: "",
  department: "",
  division: "",
})
const showConfirmModal = ref(false);
const waitCreate = ref(false);

function isUserDataValid(userData: UserRegisterFormData) {
  return userData.firstName !== "" && 
    userData.lastName !== "" &&
    isThaiCitizenId(userData.citizenid) &&
    userData.ministry !== "" &&
    userData.department !== "" &&
    userData.division !== "";
}
const isFormValid = computed(() => token.value && isUserDataValid(userRegisterFormData.value));

if(!token.value) {
  showError("Token not found");
}

async function registerGoogleAccount() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitCreate.value = true;

  const { error } = await useFetch("/api/register/firebase", {
    method: "POST",
    body: {
      token: token.value,
      ...userRegisterFormData.value,
    },
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('register.action'),
      content: i18n.t('register.failed'),
      autoCloseDelay: 5000,
    });
  
    waitCreate.value = false;
  } else {
    useShowToast({
      title: i18n.t('register.action'),
      content: i18n.t('register.success') ,
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/topics"))
  }
}
</script>