<template>
  <div class="relative" @click.stop>
    <button type="button" @click="toggleShowOption" :title="$t('navbar.user.title')">
      <MaterialIcon icon="account_circle"></MaterialIcon>
      <div class="text-white text-xs px-2 py-0.5 -mt-1 bg-dga-orange rounded-full whitespace-nowrap">
        {{ $t(`role.${roleMode}`, $t("role.guest")) }}
      </div>
    </button>
    <Teleport to="body">
      <div v-if="showOption" class="z-[402] bg-white border rounded-md rounded-b-3xl overflow-hidden shadow fixed right-0 top-20 w-64" @click.stop>
        <div class="flex-1 flex flex-col gap-2 px-4 py-4">
          <div class="font-bold flex flex-row gap-2 items-center">
            {{ perttyTime }}
            <MaterialIcon v-if="!isSync" 
              icon="priority_high" class="text-red-700 !text-base" :title="$t('navbar.user.desyncTime')"
            ></MaterialIcon>
          </div>
          <hr class="border-2 border-dga-orange w-16"/>
          <div class="font-bold">
            {{ $t('navbar.user.welcome') }}
          </div>
          <div>{{ userName }}</div>
          <DgaButton v-if="isAdmin || isDeveloper" color="dga-orange" :theme="roleMode !== 'voter' ? 'hollow' : undefined" 
            class="!py-1 !text-sm" :title="switchRoleStrOf('voter')" @click="switchRoleMode('voter')"
          >
            {{ $t('role.voter') }}
          </DgaButton>
          <DgaButton v-if="isAdmin" color="dga-orange" :theme="roleMode !== 'admin' ? 'hollow' : undefined" 
            class="!py-1 !text-sm" :title="switchRoleStrOf('admin')" @click="switchRoleMode('admin')"
          >
            {{ $t('role.admin') }}
          </DgaButton>
          <DgaButton v-if="isDeveloper" color="dga-orange" :theme="roleMode !== 'developer' ? 'hollow' : undefined" 
            class="!py-1 !text-sm" :title="switchRoleStrOf('developer')" @click="switchRoleMode('developer')"
          >
            {{ $t('role.developer') }}
          </DgaButton>
        </div>
        <a href="/api/logout" class="flex flex-row gap-2 items-center justify-center bg-dga-blue-lighter text-white px-2 py-2" :title="$t('navbar.logout')">
          <MaterialIcon icon="logout" class="!text-lg"></MaterialIcon>
          {{ $t('navbar.logout') }}
        </a>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { checkPermissionNeeds } from '~~/src/utils/permissions';
import { getComputedServerTime as serverTime, isServerTimeSync } from '~~/src/utils/datetime';

const i18n = useI18n();
const showOption = computed(() => useVisibleMenuGroup().value === 'user');

function toggleShowOption() {
  if(!showOption.value) {
    useVisibleMenuGroup().value = 'user';
  } else {
    useVisibleMenuGroup().value = undefined;
  }
}

const { SYNCTIME_THERSOLD } = useRuntimeConfig();

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

onUnmounted(() => {
  clearInterval(timeId);
})
</script>

<style scoped>
</style>