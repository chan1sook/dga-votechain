<template>
  <div class="relative" @click.stop>
    <button type="button" @click="toggleShowOption" :title="$t('navbar.notification.title')">
      <EmailOutlineIcon />
      <div v-if="isUnread" class="absolute top-0 right-0">
        <div class="absolute bg-red-500 w-2 h-2 rounded-full animate-ping"></div>
        <div class="absolute bg-red-700 w-2 h-2 rounded-full"></div>
      </div>
    </button>
    <div v-if="showOption" class="z-[401] bg-white border rounded-md rounded-b-3xl shadow fixed right-0 top-16 lg:top-20 w-72 max-h-[400px] overflow-y-auto" @click.stop>
      <div class="flex-1 flex flex-col gap-2 px-4 py-2">
        <DgaHead>{{ $t('navbar.notification.title') }}</DgaHead>
        <div v-for="notification of loadedNotifications">
          <h3 class="font-bold">
            <div v-if="!notification.readAt" class="inline-block bg-red-700 w-2 h-2 rounded-full"></div>
            {{ translated(notification.title) }}
          </h3>
          <div class="text-xs">
            {{ prettyDateTime(notification.notifyAt) }} - <b>{{ notification.from }}</b>
          </div>
        </div>
        <template v-if="isLoadMoreNotifications">
          <div class="text-center text-xl italic">
            {{ $t('navbar.notification.loadingNotifications') }}
          </div>
        </template>
        <template v-else>
          <div v-if="loadedNotifications.length === 0 && !hasMoreNotifications" class="text-center text-xl italic">
            {{ $t('navbar.notification.noMoreNotifications') }}
          </div>
          <DgaButton v-if="hasMoreNotifications && isLoadMoreNotifications" color="dga-orange" class="mx-auto" :tile="$t('navbar.notification.loadMoreNotifications')" @click="loadMoreNotifications">
            {{ $t('navbar.notification.loadMoreNotifications') }}
          </DgaButton>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmailOutlineIcon from 'vue-material-design-icons/EmailOutline.vue';

import dayjs from 'dayjs';
const i18t = useI18n();

const showOption = computed(() => useVisibleMenuGroup().value === 'notification');
const loadedNotifications : Ref<Array<NotificationUserResponseData>> = ref([]);

const pagesize = ref(50);
const startid = computed(() => {
  return loadedNotifications.value.length > 0 ? loadedNotifications.value[loadedNotifications.value.length - 1]._id : undefined;
})
const hasMoreNotifications = ref(false);
const isLoadMoreNotifications = ref(false);
const isToggleActive = ref(false);
const isUnread = ref(false);

function prettyDateTime(date: any) {
  return i18t.d(dayjs(date).toDate(), "short");
}
function checkIsUnread() {
  return loadedNotifications.value.length > 0 && loadedNotifications.value.some((ele) => ele.readAt === undefined);
}

function translated(str: string) {
  return str.replace(/\{\{[.a-zA-Z0-9_]+\}\}/g, (substr) => {
    const rawStr = substr.replace(/[\{\}]/g, "");
    return i18t.t(rawStr, rawStr);
  })
}

async function toggleShowOption() {
  if(!showOption.value) {
    if(!isToggleActive.value) {
      isToggleActive.value = true;
      useVisibleMenuGroup().value = 'notification';
      loadedNotifications.value = [];
      await setReadAll();
      await loadMoreNotifications();
      isToggleActive.value = false;
    }
  } else {
    useVisibleMenuGroup().value = undefined;
  }
}

async function setReadAll() {
  isLoadMoreNotifications.value = true;

  await useFetch("/api/notification/readall", {
    method: "POST"
  });
  
  isUnread.value = checkIsUnread();
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

socket.on(`hasNotify/${useSessionData().value.sid}`, (notifyData: NotificationStorageData | undefined) => {
  if(notifyData) {
    isUnread.value = notifyData.unread;
  }
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