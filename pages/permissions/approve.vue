<template>
  <div>
    <DgaHead>Approve Request Permissions</DgaHead>
    <div class="grid-2-content">
      <template v-for="request of permissionsList">
        <div class="flex flex-row gap-2 items-center">
          <button type="button" class="inline-flex gap-2 items-center justify-center" title="Approve" @click="setApprovePermissions(request._id, 'approved')">
            <MaterialIcon icon="check" />
          </button>
          <button type="button" class="inline-flex gap-2 items-center justify-center" title="Reject" @click="setApprovePermissions(request._id, 'rejected')">
            <MaterialIcon icon="close" />
          </button>
        </div>
        <div class="border-l border-dga-blue pl-2">
          <div class="flex flex-row gap-2 flex-wrap">
            <b>Userid:</b>
            <span>{{ request.userid }}</span>
          </div>
          <div class="flex flex-row gap-2 flex-wrap">
            <b>Some DID Data:</b> 
            <abbr title="Citizen ID">{{ request.digitalIdUserInfo.citizen_id }}</abbr>
            <abbr title="Name">{{ formatFullName(request.digitalIdUserInfo) }}</abbr>
            <abbr v-if="request.digitalIdUserInfo.email" title="Email">{{ request.digitalIdUserInfo.email }}</abbr>
          </div>
          <div class="flex flex-row gap-2 flex-wrap">
            <b>Note:</b> 
            <span v-if="request.note">{{ request.note }}</span>
            <span v-else class="italic">None</span>
          </div>
          <div class="flex flex-row gap-x-2 flex-wrap">
            <b>Permissions: </b>
            <details>
              <summary>{{ request.preset }}</summary>
              <abbr v-for="permission of request.permissions" :title="getFullPermissionTitle(permission)">
                {{ permission }}
              </abbr>
            </details>
          </div>
        </div>
        <hr class="col-span-2">
      </template>
      <div v-if="permissionsList.length === 0" class="col-span-2 italic text-2xl text-center">
        Requests not found
      </div>
    </div>
    <DgaLoadingModal :show="isWaitAction">
    </DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import { getFullPermissionTitle } from "~~/src/utils/permissions";
import { webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${webAppName} - Approve Request Permissions`
});

const { data } = await useFetch("/api/permissions/request/lists");

const permissionsList: Ref<Array<RequestPermissionsListData>> = ref([]);
const isWaitAction = ref(false);

if (!data.value) {
  showError("Can't get Request Permissions List");
} else {
  permissionsList.value =  data.value?.requestPermissions;
}

function formatFullName(digitalIdData: DigitalIDUserDataResponse) {
  const { given_name, family_name, middle_name } = digitalIdData;
  let result = given_name
  if(middle_name) {
    result += ` (${middle_name})`
  }
  result +=  ` ${family_name}`
  return result;
}

async function setApprovePermissions(id: string, status: RequestPermissionStatus) {
  isWaitAction.value = true;

  await useFetch(`/api/permissions/approve/${id}`, {
    method: "POST",
    body: {
      status
    }
  })
  
  const { data } = await useFetch("/api/permissions/request/lists");

  if (!data.value) {
    showError("Can't get Request Permissions List");
  } else {
    permissionsList.value =  data.value?.requestPermissions;
  }

  isWaitAction.value = false;
}


</script>

<style scoped>
.grid-2-content {
  @apply p-2 my-2 grid gap-2 items-start rounded-lg border-2 border-dga-blue;
  grid-template-columns: min-content auto;
}
</style>