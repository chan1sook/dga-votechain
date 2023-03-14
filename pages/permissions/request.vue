<template>
    <div class="p-4 w-full mx-auto">
      <div class="border-2 border-gray-200 rounded-lg shadow p-4">
        <h1 class="text-3xl font-bold text-center mb-4">
          {{ webAppName }}
        </h1>
        <h2 class="text-2xl font-bold text-center mb-4">
          Request Permissions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto my-4">
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-start gap-2">
            <label class="flex-none">Note for approver</label>
            <textarea v-model="permissionsData.note" class="dga-evote-input w-0 flex-1 h-32" placeholder="Note"></textarea>
          </div>
          <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Presets Permissions</label>
            <select class="dga-evote-input w-0 flex-1" @change="setPermissionsPreset">
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <BasicListItem v-for="permission of getRequestablePermissions()" no-animation>
              <template #header>
                <input v-model="permissionsData.permissions" type="checkbox" :value="permission" :disabled="!permissionEditable" class="scale-125" />
              </template>
              <b>{{ permission }}</b> {{  getFullPermissionTitle(permission) }}
            </BasicListItem>
          </div>
          <div class="md:col-span-2 my-2 text-center">
            <input v-model="consentPeronalId" type="checkbox" class="scale-125" required /> Allow to use Digital ID for Request Permissions
          </div>
          <div class="md:col-span-2 my-2 text-center">
            <button type="button" class="dga-evote-btn w-full max-w-sm inline-flex gap-2 items-center justify-center" title="Request Permissions" :disabled="!isFormValid" @click="requestPermissions">
              <MaterialIcon icon="ballot" />
              <span class="truncate">Request Permissions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { getFullPermissionTitle, getRequestablePermissions, getPresetPermissions } from "~~/src/utils/permissions";
import { goBack, webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-voter"]
})

useHead({
  title: `${webAppName} - Request Permissions`
});

const permissionsData = ref<RequestPermissionsFormData>({
  permissions: getPresetPermissions(),
  note: "",
});
const permissionEditable = ref(false);
const consentPeronalId = ref(false);

const isFormValid = computed(() => consentPeronalId.value && permissionsData.value.permissions.length > 0);

function setPermissionsPreset(payload: Event) {
  if(payload.target instanceof HTMLSelectElement) {
    permissionsData.value.permissions = getPresetPermissions(payload.target.value)
    permissionEditable.value = payload.target.value === "custom";
  }
}

async function requestPermissions() {
  if(!isFormValid.value) {
    return;
  }
  
  const { data } = await useFetch("/api/permissions/request/create", {
    method: "POST",
    body: permissionsData.value,
  });

  goBack();
}
</script>