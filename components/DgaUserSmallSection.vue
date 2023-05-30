<template>
  <div @click.stop>
    <div class="flex flex-row gap-2 px-2 py-1">
      <div class="flex-1 flex flex-col gap-y-1 justify-center items-center whitespace-nowrap">
        <div>{{ userName }} ({{ $t(`role.${roleMode}`, $t("role.guest")) }})</div>
        <div class="font-bold flex flex-row gap-2 items-center">
          {{ perttyTime }}
          <ExclamationIcon v-if="!isSync" class="text-red-700 !text-base" :title="$t('navbar.user.desyncTime')"/>
        </div>
        <div class="flex flex-row flex-wrap gap-x-2 gap-y-1 justify-center items-center">
          <DgaButton v-if="(isAdmin || isDeveloper) && roleMode !== 'voter'" color="dga-orange" theme="hollow" 
            class="!py-1 !text-sm" :title="switchRoleStrOf('voter')" @click="switchRoleMode('voter')"
          >
            {{ $t('role.voter') }}
          </DgaButton>
          <DgaButton v-if="isAdmin && roleMode !== 'admin'" color="dga-orange" theme="hollow" 
            class="!py-1 !text-sm" :title="switchRoleStrOf('admin')" @click="switchRoleMode('admin')"
          >
            {{ $t('role.admin') }}
          </DgaButton>
          <DgaButton v-if="isDeveloper && roleMode !== 'developer'" color="dga-orange" theme="hollow" 
            class="!py-1 !text-sm" :title="switchRoleStrOf('developer')" @click="switchRoleMode('developer')"
          >
            {{ $t('role.developer') }}
          </DgaButton>
        </div>
      </div>
    </div>
    <a href="/api/logout" class="flex flex-row gap-2 items-center text-sm px-2 py-1 justify-center bg-dga-blue-lighter text-white" :title="$t('navbar.logout')" @click="beforeLogout">
      <LogoutIcon class="!text-lg" />
      {{ $t('navbar.logout') }}
    </a>
  </div>
</template>

<script setup lang="ts">
import ExclamationIcon from 'vue-material-design-icons/Exclamation.vue';
import LogoutIcon from 'vue-material-design-icons/Logout.vue';

import dayjs from 'dayjs';
import { checkPermissionNeeds } from '~~/src/utils/permissions';
import { getComputedServerTime as serverTime, isServerTimeSync } from '~~/src/utils/datetime';
import { signOut } from 'firebase/auth';

const i18n = useI18n();

const { public: {SYNCTIME_THERSOLD } } = useRuntimeConfig();

const todayTime = ref(Date.now());
const isSync = ref(false);

const perttyTime = computed(() => {
  const datetime = dayjs(todayTime.value).toDate()
  return i18n.d(datetime, 'long');
});

const userName = computed(() => {
  let name = i18n.t("navbar.user.anonymous");
  const sessionData = useSessionData().value;
  if(sessionData.firstName) {
    name = sessionData.firstName;
    if(sessionData.lastName) {
      name += " " + sessionData.lastName;
    }
  }
  return name;
})

const isDeveloper = computed(() => checkPermissionNeeds(useSessionData().value.permissions, "dev-mode"));
const isAdmin = computed(() => checkPermissionNeeds(useSessionData().value.permissions, 'admin-mode'));

function updateTime() {
  todayTime.value = serverTime().getTime();
  isSync.value = isServerTimeSync(SYNCTIME_THERSOLD);
}

const roleMode = computed(() => useSessionData().value.roleMode);

function switchRoleStrOf(role: UserRole) {
  return `${i18n.t('navbar.user.switchRoleMode')} [${i18n.t(`role.${role}`)}]`
}

async function switchRoleMode(role: UserRole) {
  const { data } = await useFetch("/api/session/switch", {
    method: "POST",
    body: { newMode: role }
  });
  useVisibleMenuGroup().value = undefined;
  useRouter().go(0);
}

let timeId: NodeJS.Timer | undefined;
onMounted(() => {
  timeId = setInterval(updateTime, 1000);
  updateTime();
})

const nuxtApp = useNuxtApp()
async function beforeLogout() {
  await signOut(nuxtApp.$auth);

  return true;
}

onUnmounted(() => {
  clearInterval(timeId);
})
</script>

<style scoped>
</style>