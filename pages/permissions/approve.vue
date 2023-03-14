<template>
    <div class="p-4 w-full mx-auto">
      <div class="border-2 border-gray-200 rounded-lg shadow p-4">
        <h1 class="text-3xl font-bold text-center mb-4">
          {{ webAppName }}
        </h1>
        <h2 class="text-2xl font-bold text-center mb-4">
          Approve Request Permissions
        </h2>
        <div class="grid grid-cols-1 gap-4 max-w-7xl mx-auto my-4">
        <BasicCard>
          <template #header>Request Permissions</template>
          <div v-if="permissionsList.length > 0" class="p-2 overflow-auto max-h-60">
            <BasicListItem v-for="data of permissionsList"  header-class="w-16" no-animation unlimit-lines>
              <template #header>
                <button type="button" class="inline-flex gap-2 items-center justify-center" title="Approve" @click="setApprovePermissions(data._id, 'approved')">
                  <MaterialIcon icon="check" />
                </button>
                <button type="button" class="inline-flex gap-2 items-center justify-center" title="Reject" @click="setApprovePermissions(data._id, 'rejected')">
                  <MaterialIcon icon="close" />
                </button>
              </template>
              <div class="flex flex-row gap-2 flex-wrap">
                <b>Userid:</b>
                <span>{{ data.userid }}</span>
              </div>
              <div class="flex flex-row gap-2 flex-wrap">
                <b>Some DID Data:</b> 
                <abbr title="Citizen ID">{{ data.digitalIdUserInfo.citizen_id }}</abbr>
                <abbr title="Name">{{ formatFullName(data.digitalIdUserInfo) }}</abbr>
                <abbr v-if="data.digitalIdUserInfo.email" title="Email">{{ data.digitalIdUserInfo.email }}</abbr>
              </div>
              <div class="flex flex-row gap-2 flex-wrap">
                <b>Note:</b> 
                <span v-if="data.note">{{ data.note }}</span>
                <span v-else class="italic">None</span>
              </div>
              <div class="flex flex-row gap-x-2 flex-wrap">
                <b>Permissions: </b>
                <abbr v-for="permission of data.permissions" :title="getFullPermissionTitle(permission)">
                  {{ permission }}
                </abbr>
              </div>
            </BasicListItem>
          </div>
          <div v-else class="p-2 text-center italic">Not found</div>
        </BasicCard>
      </div>
      </div>
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
}


</script>