<template>
  <div>
    <DgaHead>Request Permissions</DgaHead>
    <div v-if="allowInputForm" class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto my-4">
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-start gap-2">
        <label class="flex-none">Note for approver</label>
        <textarea v-model="permissionsData.note" class="dga-evote-input w-0 flex-1 h-32" placeholder="Note"></textarea>
      </div>
      <div class="md:col-span-2 p-2 pb-0 flex flex-row items-center gap-2">
        <label class="flex-none">Request to</label>
        <select class="dga-evote-input w-0 flex-1" @change="setPermissionsPreset">
          <option value="moderator">Moderator</option>
          <option value="developer">Developer</option>
        </select>
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
        <DgaCheckbox v-model="consentPersonalId" required></DgaCheckbox> Allow to use Digital ID for Request Permissions
      </div>
      <DgaButtonGroup class="md:col-span-2 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" title="Request Permissions" :disabled="!isFormValid" @click="requestPermissions"
        >
        <MaterialIcon icon="ballot" />
          <span class="truncate">Request Permissions</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <div v-else class="tetx-center text-2xl">
      Please wait before request again
    </div>
    <DgaLoadingModal :show="waitRequest"></DgaLoadingModal>
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
  
  waitRequest.value = true;

  const { data, error } = await useFetch("/api/permissions/request/create", {
    method: "POST",
    body: permissionsData.value,
  });

  if(error.value) {
    useShowToast({
      title: "Add Request Permissions",
      content: "Add Request Permissions Failed",
      autoCloseDelay: 5000,
    });
  } else {
    useShowToast({
      title: "Add Request",
      content: "Add Request Permissions Successful",
      autoCloseDelay: 5000,
    });

    goBack();
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