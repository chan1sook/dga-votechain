<template>
  <div class="relative">
    <button type="button" @click="toggleShowOption" title="User Info">
      <MaterialIcon icon="account_circle"></MaterialIcon>
      <div class="text-white text-xs px-2 py-0.5 -mt-1 bg-dga-orange rounded-full">
        {{ prettyRoleMode }}
      </div>
    </button>
    <Teleport to="body">
      <div v-if="showOption" class="z-[402] bg-white border rounded-md rounded-b-3xl overflow-hidden shadow fixed right-0 top-20 w-64">
        <div class="flex-1 flex flex-col gap-2 px-4 py-4">
          <div class="font-bold flex flex-row gap-2 items-center">
            {{ perttyTime }}
            <MaterialIcon v-if="!isSync" icon="priority_high" class="text-red-700 !text-base" title="Desync time"></MaterialIcon>
          </div>
          <hr class="border-2 border-dga-orange w-16"/>
          <div class="font-bold">Welcome to e-Voting</div>
          <div>{{ userName }}</div>
          <DgaButton color="dga-orange" :theme="roleMode !== 'voter' ? 'hollow' : undefined" v-if="isAdmin || isDeveloper"  class="!py-1 !text-sm" @click="switchRoleMode('voter')">
            Voter
          </DgaButton>
          <DgaButton color="dga-orange" :theme="roleMode !== 'admin' ? 'hollow' : undefined"  v-if="isAdmin" class="!py-1 !text-sm" @click="switchRoleMode('admin')">
            Admin
          </DgaButton>
          <DgaButton color="dga-orange" :theme="roleMode !== 'developer' ? 'hollow' : undefined"  v-if="isDeveloper" class="!py-1 !text-sm" @click="switchRoleMode('developer')">
            Developer
          </DgaButton>
        </div>
        <a href="/api/logout" class="block bg-dga-blue-lighter text-white px-2 py-2 text-center">
          <MaterialIcon icon="logout"></MaterialIcon>
          Logout
        </a>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { getDigitalIdName } from '~~/src/utils/digitalid-protocol';
import { checkPermissionNeeds } from '~~/src/utils/permissions';
import { getComputedServerTime as serverTime, isServerTimeSync } from '~~/src/utils/datetime';

const showOption = computed(() => useVisibleMenu().value === 'user');

function toggleShowOption() {
  if(!showOption.value) {
    useVisibleMenu().value = 'user';
  } else {
    useVisibleMenu().value = undefined;
  }
}

const { SYNCTIME_THERSOLD } = useRuntimeConfig();

const todayTime = ref(Date.now());
const isSync = ref(false);

const perttyTime = computed(() => dayjs(todayTime.value).format("YYYY-MM-DD HH:mm"));
const userName = computed(() => {
  const digitalIdInfo = useSessionData().value?.digitalIdUserInfo;
  if(digitalIdInfo) {
    return getDigitalIdName(digitalIdInfo);
  } else {
    return "Guest"
  }
})

const isDeveloper = computed(() => checkPermissionNeeds(useSessionData().value.permissions, "access-pages:developer"));
const isAdmin = computed(() => checkPermissionNeeds(useSessionData().value.permissions, "access-pages:admin"));


function updateTime() {
  todayTime.value = serverTime().getTime();
  isSync.value = isServerTimeSync(SYNCTIME_THERSOLD);
}

const roleMode = computed(() => useSessionData().value.roleMode);
const prettyRoleMode = computed(() => {
  if(roleMode.value) {
    return roleMode.value[0].toUpperCase() + roleMode.value.slice(1);
  }
  return "Guest"
})

async function switchRoleMode(role: UserRole) {
  const { data } = await useFetch("/api/session/switch", {
    method: "POST",
    body: { newMode: role }
  });
  useVisibleMenu().value = undefined;
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