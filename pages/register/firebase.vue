<template>
  <div v-if="token">
    <DgaHead>{{ $t("register.firebase.title") }}</DgaHead>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto my-4">
      <div class="md:col-span-2 flex flex-row gap-2 items-center">
        <div>
          {{ $t('register.firebase.token') }}
        </div>
        <DgaInput :value="token" disabled class="flex-1" :placeholder="$t('register.firebase.token')"></DgaInput>
      </div>
      <div class="md:col-span-2 flex flex-row gap-2 items-center">
        <div>
          {{ $t('register.citizenid') }}
        </div>
        <DgaInput v-model="citizenid" class="flex-1" :placeholder="$t('register.citizenid')"></DgaInput>
      </div>
      <DgaButtonGroup class="md:col-span-2 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('register.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <MaterialIcon icon="how_to_reg" />
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
const citizenid = ref("");
const showConfirmModal = ref(false);
const waitCreate = ref(false);

const isFormValid = computed(() => token.value && isThaiCitizenId(citizenid.value));

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
      token: token,
      citizenid: citizenid,
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