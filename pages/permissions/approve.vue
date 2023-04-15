<template>
  <div>
    <DgaHead>{{ $t('requestPermissions.approveRequestPermissions') }}</DgaHead>
    <div class="grid-2-content">
      <template v-for="request of permissionsList">
        <div class="flex flex-row gap-2 items-center">
          <button type="button" class="inline-flex gap-2 items-center justify-center" :title="$t('requestPermissions.approve')"
            @click="setApprovePermissions(request._id, 'approved')">
            <MaterialIcon icon="check" />
          </button>
          <button type="button" class="inline-flex gap-2 items-center justify-center" :title="$t('requestPermissions.reject')" @click="setApprovePermissions(request._id, 'rejected')">
            <MaterialIcon icon="close" />
          </button>
        </div>
        <div class="border-l border-dga-blue pl-2">
          <div class="flex flex-row gap-2 flex-wrap">
            <b>{{ $t('requestPermissions.userid') }}:</b>
            <span>{{ request.userid }}</span>
          </div>
          <div class="flex flex-row gap-2 flex-wrap">
            <b>{{ $t('requestPermissions.personalData') }}:</b> 
            <abbr v-if="request.personalData.citizenId" :title="$t('requestPermissions.citizenid')">{{ request.personalData.citizenId }}</abbr>
            <abbr :title="$t('requestPermissions.name')">{{ formatFullName(request.personalData) }}</abbr>
            <abbr v-if="request.personalData.email" :title="$t('requestPermissions.email')">{{ request.personalData.email }}</abbr>
          </div>
          <div class="flex flex-row gap-2 flex-wrap">
            <b>{{ $t('requestPermissions.note')  }}:</b> 
            <span v-if="request.note">{{ request.note }}</span>
            <span v-else class="italic">{{ $t('requestPermissions.noteNone') }}</span>
          </div>
          <div class="flex flex-row gap-x-2 flex-wrap">
            <b>{{ $t('requestPermissions.permissions') }}: </b>
            <details>
              <summary>
                {{ $t(`requestPermissions.add.requestTo.${request.preset}`, request.preset) }}
              </summary>
              <abbr v-for="permission of request.permissions" :title="getFullPermissionTitle(permission)">
                {{ permission }}
              </abbr>
            </details>
          </div>
        </div>
        <hr class="col-span-2">
      </template>
      <div v-if="permissionsList.length === 0" class="col-span-2 italic text-2xl text-center">
        {{ $t('requestPermissions.requestsNotFound') }}
      </div>
    </div>
    <DgaLoadingModal :show="isWaitAction">
    </DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('requestPermissions.approveRequestPermissions')}`
});

function getFullPermissionTitle(permission: EVotePermission) {
  return i18n.t(`permissions.${permission}`, permission);
}

const { data } = await useFetch("/api/permissions/request/lists");

const permissionsList: Ref<Array<RequestPermissionsListData>> = ref([]);
const isWaitAction = ref(false);

if (!data.value) {
  showError("Can't get Request Permissions List");
} else {
  permissionsList.value =  data.value?.requestPermissions;
}

function formatFullName(personalData: { firstName?: string, lastName?: string}) {
  if(personalData.firstName) {
    return personalData.lastName ? `${personalData.firstName} ${personalData.lastName}` : personalData.firstName;
  }
  return "-"
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