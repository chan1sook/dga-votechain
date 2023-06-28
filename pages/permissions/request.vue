<template>
  <div>
    <DgaHead>{{ $t('app.requestPermissions.add.title') }}</DgaHead>
    <div v-if="allowInputForm" class="grid grid-cols-12 gap-x-4 gap-y-2 max-w-7xl mx-auto my-4">
      <label class="col-span-12 md:col-span-2">{{ $t('app.requestPermissions.add.noteToApprover') }}</label>
      <div class="col-span-12 md:col-span-10">
        <DgaTextArea v-model="permissionsData.note" :placeholder="$t('app.requestPermissions.note')" class="w-full"></DgaTextArea>
      </div>
      <label class="col-span-12 md:col-span-2">{{ $t('app.requestPermissions.add.requestTo.title') }}</label>
      <div class="col-span-12 md:col-span-10">
        <DgaVueSelect 
          v-model="permissionsData.preset" :options="presetOptions"
          :reduce="val => val.value"
        ></DgaVueSelect>
      </div>
      <div v-if="permissionEditable" class="col-span-12 grid-2-content">
        <template v-for="permission of getRequestablePermissions()">
          <DgaCheckbox v-model="permissionsData.permissions" :value="permission" :disabled="!permissionEditable"></DgaCheckbox>
          <div class="line-clamp-3">
            <b>{{ permission }}</b> {{ getFullPermissionTitle(permission)  }}
          </div>
        </template>
      </div>
      <div class="col-span-12 my-2 text-center">
        <DgaCheckbox v-model="consentPersonalId" required></DgaCheckbox> {{ $t('app.requestPermissions.add.allowConsent') }}
      </div>
      <DgaButtonGroup class="col-span-12 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" title="Request Permissions" :disabled="!isFormValid" @click="requestPermissions"
        >
          <BallotOutlineIcon />
          <span class="truncate">{{ $t('app.requestPermissions.add.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <div v-else class="tetx-center text-2xl">
      {{ $t('app.requestPermissions.add.pendingBlocked') }}
    </div>
    <DgaLoadingModal :show="waitRequest"></DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import BallotOutlineIcon from 'vue-material-design-icons/BallotOutline.vue';
import { getRequestablePermissions, getPresetPermissions } from '~/src/services/form/permission';


const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-voter"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.requestPermissions.add.title')}`
});

function getFullPermissionTitle(permission: EVotePermission) {
  return i18n.t(`app.permissions.${permission}`, permission);
}

const presetOptions  = computed(() => ["moderator", "developer"].map((value) => {
  return {
    label: i18n.t(`app.requestPermissions.add.requestTo.${value}`),
    value: value
  }
}));

const permissionsData = ref<RequestPermissionsFormData>({
  permissions: getPresetPermissions(),
  note: "",
  preset: "moderator",
});
const permissionEditable = ref(false);
const consentPersonalId = ref(false);
const allowInputForm = ref(true);
const waitRequest = ref(false);

const { data } = await useFetch("/api/permissions/request/current");
if(data.value?.requestPermissions) {
  allowInputForm.value = false;
}

const isFormValid = computed(() => consentPersonalId.value && permissionsData.value.permissions.length > 0);

const _preset = computed(() => permissionsData.value.preset);
watch(_preset, (value) => {
  permissionsData.value.permissions = getPresetPermissions(value)
  permissionEditable.value = (value === "custom");
}, { immediate: true });

async function requestPermissions() {
  if(!isFormValid.value) {
    return;
  }
  
  waitRequest.value = true;

  const { data, error } = await useFetch("/api/permissions/request/create", {
    method: "POST",
    body: permissionsData.value,
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('app.requestPermissions.add.title'),
      content: i18n.t('app.requestPermissions.add.failed'),
      autoCloseDelay: 5000,
    });
  } else {
    useShowToast({
      title: i18n.t('app.requestPermissions.add.title'),
      content: i18n.t('app.requestPermissions.add.success'),
      autoCloseDelay: 5000,
    });

    navigateTo(localePathOf("/"));
  }

  waitRequest.value = false;
}
</script>

<style scoped>
.grid-2-content {
  @apply p-4 my-2 grid gap-2 items-center rounded-lg border-2 border-dga-orange;
  grid-template-columns: min-content auto;
}
</style>