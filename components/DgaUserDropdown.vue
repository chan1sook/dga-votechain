<template>
  <div class="relative" @click.stop>
    <button
      type="button"
      @click="toggleShowOption"
      :title="$t('app.navbar.user.title')"
      class="flex flex-col items-center"
    >
      <AccountCircleOutlineIcon :size="30" />
      <div
        v-if="isLogin"
        class="mt-1 whitespace-nowrap rounded-full bg-dga-orange px-2 text-xs text-white"
      >
        {{ $t(`app.role.${roleMode}`, $t("app.role.guest")) }}
      </div>
    </button>
    <div
      v-if="showOption"
      class="fixed right-0 top-16 z-[402] overflow-hidden rounded-md rounded-b-3xl border bg-white shadow lg:top-20"
      :class="[isLogin ? 'w-64' : 'w-96']"
      @click.stop
    >
      <DgaLoginModule v-if="!isLogin" class="px-8 py-4"></DgaLoginModule>
      <template v-else>
        <div class="flex flex-1 flex-col gap-2 px-4 py-4">
          <div class="flex flex-row items-center gap-2 font-bold">
            {{ perttyTime }}
            <ExclamationIcon
              v-if="!isSync"
              class="!text-base text-red-700"
              :title="$t('app.navbar.user.desyncTime')"
            />
          </div>
          <hr class="w-16 border-2 border-dga-orange" />
          <div class="font-bold">
            {{ $t("app.navbar.user.welcome") }}
          </div>
          <div class="flex flex-row gap-2">
            <div>{{ userName }}</div>
          </div>
          <DgaButton
            v-if="isAdmin || isDeveloper"
            color="dga-orange"
            :theme="roleMode !== 'voter' ? 'hollow' : undefined"
            class="!py-1 !text-sm"
            :title="switchRoleStrOf('voter')"
            @click="switchRoleMode('voter')"
          >
            {{ $t("app.role.voter") }}
          </DgaButton>
          <DgaButton
            v-if="isAdmin"
            color="dga-orange"
            :theme="roleMode !== 'admin' ? 'hollow' : undefined"
            class="!py-1 !text-sm"
            :title="switchRoleStrOf('admin')"
            @click="switchRoleMode('admin')"
          >
            {{ $t("app.role.admin") }}
          </DgaButton>
          <DgaButton
            v-if="isDeveloper"
            color="dga-orange"
            :theme="roleMode !== 'developer' ? 'hollow' : undefined"
            class="!py-1 !text-sm"
            :title="switchRoleStrOf('developer')"
            @click="switchRoleMode('developer')"
          >
            {{ $t("app.role.developer") }}
          </DgaButton>
          <div class="border-t-2"></div>
          <NuxtLink
            href="/user/preferences"
            class="w-full"
            @click="useVisibleMenuGroup().value = undefined"
          >
            <DgaButton
              color="dga-orange"
              theme="hollow"
              class="w-full !py-1 !text-sm"
              :title="$t('app.preferences.title')"
            >
              {{ $t("app.preferences.title") }}
            </DgaButton>
          </NuxtLink>
          <template v-if="allowWithdraw">
            <div class="border-t-2"></div>
            <DgaButton
              color="gray"
              theme="hollow"
              class="w-full !py-1 !text-sm"
              :title="$t('app.navbar.withdrawUser.title')"
              @click="showWithdrawUserModal = true"
            >
              {{ $t("app.navbar.withdrawUser.title") }}
            </DgaButton>
          </template>
        </div>
        <form action="/api/logout" method="POST" class="w-full">
          <button
            type="submit"
            class="flex w-full flex-row items-center justify-center gap-2 bg-dga-blue-lighter px-2 py-2 text-white"
            :title="$t('app.navbar.logout')"
          >
            <LogoutIcon class="!text-lg" />
            {{ $t("app.navbar.logout") }}
          </button>
        </form>
      </template>
    </div>
    <DgaLoadingModal :show="waitSwap"></DgaLoadingModal>
    <DgaModal
      :show="showWithdrawUserModal"
      cancel-backdrop
      @confirm="withdrawUser"
      @close="showWithdrawUserModal = false"
      @cancel="showWithdrawUserModal = false"
    >
      <div>{{ $t("app.navbar.withdrawUser.confirm1") }}</div>
      <div>{{ $t("app.navbar.withdrawUser.confirm2") }}</div>
      <form
        ref="withdrawForm"
        action="/api/user/withdraw"
        method="POST"
        class="hidden"
      ></form>
    </DgaModal>
  </div>
</template>

<script setup lang="ts">
import AccountCircleOutlineIcon from "vue-material-design-icons/AccountCircleOutline.vue";
import ExclamationIcon from "vue-material-design-icons/Exclamation.vue";
import LogoutIcon from "vue-material-design-icons/Logout.vue";

import dayjs from "dayjs";
import { checkPermissionNeeds } from "~/src/services/validations/permission";

const i18n = useI18n();
const localePathOf = useLocalePath();
const showOption = computed(() => useVisibleMenuGroup().value === "user");

function toggleShowOption() {
  if (!showOption.value) {
    useVisibleMenuGroup().value = "user";
  } else {
    useVisibleMenuGroup().value = undefined;
  }
}

const {
  public: { SYNCTIME_THERSOLD, ALLOW_WITHDRAW_USER },
} = useRuntimeConfig();
const allowWithdraw = computed(() => ALLOW_WITHDRAW_USER);

const todayTime = ref(Date.now());
const isSync = ref(false);
const showWithdrawUserModal = ref(false);
const withdrawForm: Ref<HTMLFormElement | null> = ref(null);

const perttyTime = computed(() => {
  const datetime = dayjs(todayTime.value).toDate();
  return i18n.d(datetime, "long");
});

const userName = computed(() => {
  let name = i18n.t("app.anonymous");
  const sessionData = useSessionData().value;
  if (sessionData.firstName) {
    name = sessionData.firstName;
    if (sessionData.lastName) {
      name += " " + sessionData.lastName;
    }
  }
  return name;
});

const isLogin = computed(() => !!useSessionData().value.userid);
const isDeveloper = computed(() =>
  checkPermissionNeeds(useSessionData().value.permissions, "dev-mode")
);
const isAdmin = computed(() =>
  checkPermissionNeeds(useSessionData().value.permissions, "admin-mode")
);

function updateTime() {
  todayTime.value = useComputedServerTime().getTime();
  isSync.value = useIsServerTimeSync(SYNCTIME_THERSOLD);
}

const roleMode = computed(() => useSessionData().value.roleMode);
const waitSwap = ref(false);

function switchRoleStrOf(role: UserRole) {
  return `${i18n.t("app.navbar.user.switchRoleMode")} [${i18n.t(
    `app.role.${role}`
  )}]`;
}

async function switchRoleMode(role: UserRole) {
  if (waitSwap.value) {
    return;
  }
  waitSwap.value = true;

  const { data } = await useFetch("/api/session/switch", {
    method: "POST",
    body: { newMode: role },
  });

  if (!useAllowRoles().value.includes(role)) {
    switch (role) {
      case "voter":
      case "admin":
        navigateTo(localePathOf("/topics"));
        break;
      default:
        navigateTo(localePathOf("/"));
        break;
    }
  } else {
    useRouter().go(0);
  }

  useVisibleMenuGroup().value = undefined;
  waitSwap.value = false;
}

function withdrawUser() {
  withdrawForm.value?.submit();
}

let timeId: NodeJS.Timer | undefined;
onMounted(() => {
  timeId = setInterval(updateTime, 1000);
  updateTime();
});

onUnmounted(() => {
  clearInterval(timeId);
});
</script>

<style scoped></style>
