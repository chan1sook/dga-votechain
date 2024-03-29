<template>
  <div>
    <DgaHead>{{
      $t("app.requestPermissions.approveRequestPermissions")
    }}</DgaHead>
    <div class="grid-2-content">
      <template v-for="request of permissionsList">
        <div class="flex flex-row items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2"
            :title="$t('app.requestPermissions.approve')"
            @click="setApprovePermissions(request._id, 'approved')"
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2"
            :title="$t('app.requestPermissions.reject')"
            @click="setApprovePermissions(request._id, 'rejected')"
          >
            <CloseIcon />
          </button>
        </div>
        <div class="overflow-x-auto border-l border-dga-orange pl-2">
          <div class="flex flex-row flex-wrap gap-2">
            <b>{{ $t("app.userid") }}:</b>
            <span>{{ request.userid }}</span>
          </div>
          <div class="flex flex-row flex-wrap gap-2">
            <b>{{ $t("app.requestPermissions.personalData") }}:</b>
            <abbr :title="$t('app.name')">{{
              formatFullName(request.personalData)
            }}</abbr>
            <abbr v-if="request.personalData.email" :title="$t('app.email')">{{
              request.personalData.email
            }}</abbr>
          </div>
          <div class="flex flex-row flex-wrap gap-2">
            <b>{{ $t("app.requestPermissions.note") }}:</b>
            <span v-if="request.note">{{ request.note }}</span>
            <span v-else class="italic">{{
              $t("app.requestPermissions.noteNone")
            }}</span>
          </div>
          <div class="flex flex-row flex-wrap gap-x-2">
            <b>{{ $t("app.requestPermissions.permissions") }}: </b>
            <details>
              <summary>
                {{
                  $t(
                    `app.requestPermissions.add.requestTo.${request.preset}`,
                    request.preset
                  )
                }}
              </summary>
              <div class="inline-flex flex-row flex-wrap gap-x-2">
                <abbr
                  v-for="permission of request.permissions"
                  :title="getFullPermissionTitle(permission)"
                >
                  {{ permission }}
                </abbr>
              </div>
            </details>
          </div>
        </div>
        <hr class="col-span-2" />
      </template>
      <div
        v-if="permissionsList.length === 0"
        class="col-span-2 text-center text-2xl italic"
      >
        {{ $t("app.requestPermissions.requestsNotFound") }}
      </div>
    </div>
    <DgaLoadingModal :show="isWaitAction"> </DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import CheckIcon from "vue-material-design-icons/Check.vue";
import CloseIcon from "vue-material-design-icons/Close.vue";

const i18n = useI18n();

definePageMeta({
  middleware: ["auth-dev"],
});

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.requestPermissions.approveRequestPermissions"
  )}`,
});

function getFullPermissionTitle(permission: EVotePermission) {
  return i18n.t(`app.permissions.${permission}`, permission);
}

const { data } = await useFetch("/api/permissions/request/lists");

const permissionsList: Ref<RequestPermissionsListData[]> = ref([]);
const isWaitAction = ref(false);

if (!data.value) {
  showError("Can't get Request Permissions List");
} else {
  permissionsList.value = data.value?.requestPermissions;
}

function formatFullName(personalData: {
  firstName?: string;
  lastName?: string;
}) {
  if (personalData.firstName) {
    return personalData.lastName
      ? `${personalData.firstName} ${personalData.lastName}`
      : personalData.firstName;
  }
  return "-";
}

async function setApprovePermissions(
  id: string,
  status: RequestPermissionStatus
) {
  isWaitAction.value = true;

  await useFetch(`/api/permissions/approve/${id}`, {
    method: "POST",
    body: {
      status,
    },
  });

  const { data } = await useFetch("/api/permissions/request/lists");

  if (!data.value) {
    showError("Can't get Request Permissions List");
  } else {
    permissionsList.value = data.value?.requestPermissions;
  }

  isWaitAction.value = false;
}
</script>

<style scoped>
.grid-2-content {
  @apply my-2 grid items-start gap-2 rounded-lg border-2 border-dga-blue p-2;
  grid-template-columns: min-content auto;
}
</style>
