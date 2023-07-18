<template>
  <div class="relative" @click.stop>
    <button
      type="button"
      @click="toggleShowOption"
      :title="$t('app.navbar.notification.title')"
    >
      <EmailOutlineIcon />
      <div v-if="isUnread" class="absolute right-0 top-0">
        <div
          class="absolute h-2 w-2 animate-ping rounded-full bg-red-500"
        ></div>
        <div class="absolute h-2 w-2 rounded-full bg-red-700"></div>
      </div>
    </button>
    <div
      v-if="showOption"
      class="fixed right-0 top-16 z-[401] max-h-[400px] w-72 overflow-y-auto rounded-md rounded-b-3xl border bg-white shadow lg:top-20"
      @click.stop
    >
      <div class="flex flex-1 flex-col gap-2 px-4 py-2">
        <DgaHead>{{ $t("app.navbar.notification.title") }}</DgaHead>
        <div v-for="notification of loadedNotifications">
          <h3 class="font-bold">
            <div
              v-if="!notification.readAt"
              class="inline-block h-2 w-2 rounded-full bg-red-700"
            ></div>
            {{ formatNotificationHeader(notification) }}
          </h3>
          <div class="text-xs">
            {{ prettyDateTime(notification.notifyAt) }} - <b>System</b>
          </div>
        </div>
        <template v-if="isLoadMoreNotifications">
          <div class="text-center text-xl italic">
            {{ $t("app.navbar.notification.loadingNotifications") }}
          </div>
        </template>
        <template v-else>
          <div
            v-if="loadedNotifications.length === 0 && !hasMoreNotifications"
            class="text-center text-xl italic"
          >
            {{ $t("app.navbar.notification.noMoreNotifications") }}
          </div>
          <DgaButton
            v-if="hasMoreNotifications && isLoadMoreNotifications"
            color="dga-orange"
            class="mx-auto"
            :tile="$t('app.navbar.notification.loadMoreNotifications')"
            @click="loadMoreNotifications"
          >
            {{ $t("app.navbar.notification.loadMoreNotifications") }}
          </DgaButton>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmailOutlineIcon from "vue-material-design-icons/EmailOutline.vue";

import dayjs from "dayjs";
import { formatNotificationHeader } from "~/src/services/formatter/notification";
const i18t = useI18n();

const showOption = computed(
  () => useVisibleMenuGroup().value === "notification"
);
const loadedNotifications: Ref<NotificationUserResponseData[]> = ref([]);

const pagesize = ref(50);
const startid = computed(() => {
  return loadedNotifications.value.length > 0
    ? loadedNotifications.value[loadedNotifications.value.length - 1]._id
    : undefined;
});
const hasMoreNotifications = ref(false);
const isLoadMoreNotifications = ref(false);
const isToggleActive = ref(false);
const isUnread = ref(false);

function prettyDateTime(date: any) {
  return i18t.d(dayjs(date).toDate(), "short");
}
function checkIsUnread() {
  return (
    loadedNotifications.value.length > 0 &&
    loadedNotifications.value.some((ele) => ele.readAt === undefined)
  );
}

async function toggleShowOption() {
  if (!showOption.value) {
    if (!isToggleActive.value) {
      isToggleActive.value = true;
      useVisibleMenuGroup().value = "notification";
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
    method: "POST",
  });

  isUnread.value = checkIsUnread();
  isLoadMoreNotifications.value = false;
}
async function fetchNotifications(pagesize: number, startid?: string) {
  const fetchResult = await Promise.all([
    useFetch("/api/notifications", {
      query: { pagesize, startid },
    }),
  ]);

  const [notifications] = fetchResult.map((ele) => ele.data.value);
  return notifications;
}

async function loadMoreNotifications() {
  isLoadMoreNotifications.value = true;

  const notifications = await fetchNotifications(pagesize.value, startid.value);
  if (notifications) {
    loadedNotifications.value.push(...notifications);
    hasMoreNotifications.value = notifications.length === pagesize.value;
    isUnread.value = checkIsUnread();
  }
  isLoadMoreNotifications.value = false;
}

let notifyID: NodeJS.Timer | undefined;

const socket = useSocketIO();

socket.on(
  `hasNotify/${useSessionData().value.userid}`,
  (notifyData: NotificationStorageData | undefined) => {
    if (notifyData) {
      isUnread.value = notifyData.unread;
    }
  }
);

onMounted(() => {
  notifyID = setInterval(() => {
    socket.volatile.emit("hasNotify", {
      userid: useSessionData().value.userid,
    });
  }, 1000);

  socket.volatile.emit("hasNotify", { userid: useSessionData().value.userid });
});

onUnmounted(() => {
  clearInterval(notifyID);
  socket.off(`hasNotify/${useSessionData().value.userid}`);
});
</script>

<style scoped></style>
