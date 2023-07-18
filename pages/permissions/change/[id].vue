<template>
  <div v-if="userData">
    <DgaHead>{{ $t("app.requestPermissions.change.title") }}</DgaHead>
    <div>
      <div class="my-2 flex flex-col gap-2 sm:flex-row">
        <div class="flex-1">
          <span v-if="userNameOf(userData)">{{ userNameOf(userData) }}</span>
          <span class="italic" v-else>{{ $t("app.anonymous") }}</span>
        </div>
        <div class="flex-1">
          <span class="font-bold"></span>{{ $t("app.email") }}:
          <template v-if="userData.email">{{ userData.email }}</template>
          <span class="italic" v-else>-</span>
        </div>
      </div>
      <h4 class="my-2 font-bold">
        {{ getFullPermissionTitle("change-permissions") }}
      </h4>

      <div
        v-for="permission of getPermissions()"
        class="my-2 flex flex-row gap-2"
      >
        <DgaCheckbox
          v-model="userData.permissions"
          :value="permission"
          :disabled="
            notSelfForbiddenPermissions.includes(permission) && isEditSelf
          "
        ></DgaCheckbox>
        <span>{{ getFullPermissionTitle(permission) }}</span>
      </div>
      <div class="flex flex-row justify-center">
        <DgaButton
          class="w-full sm:w-auto"
          color="dga-orange"
          @click="showConfirmModal = true"
          >{{ $t("app.requestPermissions.change.action") }}</DgaButton
        >
      </div>
    </div>
    <DgaModal
      :show="showConfirmModal"
      cancel-backdrop
      @confirm="changePermissions"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t("app.requestPermissions.change.confirm") }}
    </DgaModal>
    <DgaLoadingModal :show="isWaitAction"> </DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import {
  getPermissions,
  getNotSelfEditablePermissions,
} from "~/src/services/form/permission";

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-dev"],
});

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.requestPermissions.change.title"
  )}`,
});

function getFullPermissionTitle(permission: EVotePermission) {
  return i18n.t(`app.permissions.${permission}`, permission);
}

const { id: userid } = useRoute().params;
const { data } = await useFetch(`/api/user/info/${userid}`);

const userData: Ref<UserResponseDataWithIdAndPermissions | undefined> =
  ref(undefined);
const isWaitAction = ref(false);
const showConfirmModal = ref(false);

const isEditSelf = computed(() => useSessionData().value.userid === userid);

if (!data.value) {
  showError("Can't get Request Permissions List");
} else {
  userData.value = data.value;
}

function userNameOf(userData: UserResponseDataWithIdAndPermissions) {
  let name = "";
  if (userData.firstName) {
    name = userData.firstName;
    if (userData.lastName) {
      name += " " + userData.lastName;
    }
  }
  return name;
}

const notSelfForbiddenPermissions: EVotePermission[] =
  getNotSelfEditablePermissions();

async function changePermissions() {
  if (!userData.value) {
    return;
  }

  isWaitAction.value = true;

  await useFetch(`/api/permissions/change/${userid}`, {
    method: "POST",
    body: {
      permissions: userData.value.permissions,
    },
  });

  const { error } = await useFetch("/api/permissions/request/lists");

  if (error.value) {
    useShowToast({
      title: i18n.t("app.requestPermissions.change.action"),
      content: i18n.t("app.requestPermissions.change.failed"),
      autoCloseDelay: 5000,
    });
  } else {
    useShowToast({
      title: i18n.t("app.requestPermissions.change.action"),
      content: i18n.t("app.requestPermissions.change.success"),
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/admin/users"));
  }

  isWaitAction.value = false;
}
</script>

<style scoped></style>
