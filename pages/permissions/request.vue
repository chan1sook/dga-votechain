<template>
  <div>
    <DgaHead>{{ $t('requestPermissions.add.title') }}</DgaHead>
    <div v-if="allowInputForm" class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto my-4">
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-start gap-2">
        <label class="flex-none">{{ $t('requestPermissions.add.noteToApprover') }}</label>
        <DgaTextArea v-model="permissionsData.note" :placeholder="$t('requestPermissions.note')" class="w-full"></DgaTextArea>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <label class="flex-none">{{ $t('requestPermissions.add.requestTo.title') }}</label>
        <DgaSelect v-model="permissionsData.preset" :options="presetOptions"></DgaSelect>
      </div>
      <div v-if="permissionEditable" class="md:col-span-2 grid-2-content">
        <template v-for="permission of getRequestablePermissions()">
          <DgaCheckbox v-model="permissionsData.permissions" :value="permission" :disabled="!permissionEditable"></DgaCheckbox>
          <div class="line-clamp-3">
            <b>{{ permission }}</b> {{ getFullPermissionTitle(permission)  }}
          </div>
        </template>
      </div>
      <div class="md:col-span-2 my-2 text-center">
        <DgaCheckbox v-model="consentPersonalId" required></DgaCheckbox> {{ $t('requestPermissions.add.allowConsent') }}
      </div>
      <DgaButtonGroup class="md:col-span-2 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" title="Request Permissions" :disabled="!isFormValid" @click="requestPermissions"
        >
        <MaterialIcon icon="ballot" />
          <span class="truncate">{{ $t('requestPermissions.add.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <div v-else class="tetx-center text-2xl">
      {{ $t('requestPermissions.add.pendingBlocked') }}
    </div>
    <DgaLoadingModal :show="waitRequest"></DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import { getRequestablePermissions, getPresetPermissions } from "~~/src/utils/permissions";

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-voter"]
})

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('requestPermissions.add.title')}`
});

function getFullPermissionTitle(permission: EVotePermission) {
  return i18n.t(`permissions.${permission}`, permission);
}

const presetOptions  = computed(() => ["moderator", "developer"].map((value) => {
  return {
    label: i18n.t(`requestPermissions.add.requestTo.${value}`),
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
      title: i18n.t('requestPermissions.add.title'),
      content: i18n.t('requestPermissions.add.failed'),
      autoCloseDelay: 5000,
    });
  } else {
    useShowToast({
      title: i18n.t('requestPermissions.add.title'),
      content: i18n.t('requestPermissions.add.success'),
      autoCloseDelay: 5000,
    });

    navigateTo(localePathOf("/"));
  }

  waitRequest.value = false;
}
</script>

<style scoped>
.grid-2-content {
  @apply p-4 my-2 grid gap-2 items-center rounded-lg border-2 border-dga-blue;
  grid-template-columns: min-content auto;
}
</style>