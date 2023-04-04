<template>
  <div class="relative">
    <button type="button" @click="toggleShowOption" title="Notifications">
      <MaterialIcon icon="warning"></MaterialIcon>
      <div v-if="isUnread" class="absolute top-0 right-0">
        <div class="absolute bg-red-500 w-2 h-2 rounded-full animate-ping"></div>
        <div class="absolute bg-red-700 w-2 h-2 rounded-full"></div>
      </div>
    </button>
    <Teleport to="body">
      <div v-if="showOption" class="z-[401] bg-white border rounded-md rounded-b-3xl shadow fixed right-0 top-20 w-72 h-64 max-h-96 overflow-y-auto">
        <div class="flex-1 flex flex-col gap-2 px-4 py-2">
          <DgaHead>Notifications</DgaHead>
          <div v-for="notification of loadedNotifications">
            <h3 class="font-bold">
              <div v-if="!notification.read" class="inline-block bg-red-700 w-2 h-2 rounded-full"></div>
              {{ notification.title }}
            </h3>
            <div class="text-xs">
              {{ formatDateTime(notification.notifyAt) }} - <b>{{ notification.from }}</b>
            </div>
          </div>
          <template v-if="isLoadMoreNotifications">
            <div class="text-center text-xl italic">
              Loading...
            </div>
          </template>
          <template v-else>
            <div v-if="loadedNotifications.length === 0 && !hasMoreNotifications" class="text-center text-xl italic">
              No more notifications
            </div>
            <DgaButton v-if="hasMoreNotifications && isLoadMoreNotifications" color="dga-orange" class="mx-auto" @click="loadMoreNotifications">Load more notifications</DgaButton>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~~/src/utils/datetime';

const showOption = computed(() => useVisibleMenu().value === 'notification');
const loadedNotifications : Ref<Array<NotificationUserResponseData>> = ref([]);

const pagesize = ref(50);
const startid = computed(() => {
  return loadedNotifications.value.length > 0 ? loadedNotifications.value[loadedNotifications.value.length - 1]._id : undefined;
})
const hasMoreNotifications = ref(false);
const isLoadMoreNotifications = ref(false);
const isToggleActive = ref(false);
const isUnread = ref(false);

function checkIsUnread() {
  return loadedNotifications.value.length > 0 && loadedNotifications.value.some((ele) => ele.read === undefined);
}

async function toggleShowOption() {
  if(!showOption.value) {
    if(!isToggleActive.value) {
      isToggleActive.value = true;
      useVisibleMenu().value = 'notification';
      loadedNotifications.value = [];
      await setReadAll();
      await loadMoreNotifications();
      isToggleActive.value = false;
    }
  } else {
    useVisibleMenu().value = undefined;
  }
}

async function setReadAll() {
  isLoadMoreNotifications.value = true;

  await useFetch("/api/notification/readall", {
    method: "POST"
  });
  
  isLoadMoreNotifications.value = false;
}
async function fetchNotifications(pagesize: number, startid?: string) {
  const fetchResult = await Promise.all([
    useFetch("/api/notifications", {
      query: { pagesize, startid }
    })
  ])

  const [ notifications ] = fetchResult.map((ele) => ele.data.value);
  return notifications;
}

async function loadMoreNotifications() {
  isLoadMoreNotifications.value = true;
  
  const notifications = await fetchNotifications(pagesize.value, startid.value);
  if(notifications) {
    loadedNotifications.value.push(...notifications.notifications);
    hasMoreNotifications.value = notifications.notifications.length === pagesize.value;
    isUnread.value = checkIsUnread();
  }
  isLoadMoreNotifications.value = false;
}

let notifyID : NodeJS.Timer | undefined;

const socket = useSocketIO();

socket.on(`hasNotify/${useSessionData().value.sid}`, (hasNotify) => {
  isUnread.value = hasNotify;
})

onMounted(() => {
  notifyID = setInterval(() => {
    socket.volatile.emit("hasNotify", { sid: useSessionData().value.sid });
  }, 1000);
  
  socket.volatile.emit("hasNotify", { sid: useSessionData().value.sid });
})

onUnmounted(() => {
  clearInterval(notifyID);
  socket.off(`hasNotify/${useSessionData().value.sid}`);
});

</script>

<style scoped>
</style>