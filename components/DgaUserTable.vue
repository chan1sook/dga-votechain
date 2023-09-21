<template>
  <div class="flex flex-col gap-2">
    <div class="max-h-[50vh] overflow-auto">
      <div
        class="user-grid"
        :class="[props.multipleVotes && !props.coadmin ? 'multichoice' : '']"
      >
        <div class="font-bold"></div>
        <div class="font-bold">{{ $t("app.userName") }}</div>
        <div class="font-bold">{{ $t("app.email") }}</div>
        <div v-if="props.multipleVotes && !props.coadmin" class="font-bold">
          {{ $t("app.voterList.totalVotes") }}
        </div>
        <div></div>
        <div class="border-b-2 border-dga-blue" style="grid-column: 1/-1"></div>
        <template v-for="user of props.users">
          <div>
            <ExclamationIcon
              :class="[isUserValid(user) ? 'invisible' : '']"
              class="text-red-500"
              :title="getErrorReason(user)"
            />
          </div>
          <div>{{ user.firstName ? getFullName(user) : "-" }}</div>
          <div>{{ user.email || "-" }}</div>
          <div v-if="props.multipleVotes && !props.coadmin">
            <slot name="multipleVotes" :user="user"></slot>
          </div>
          <div>
            <button
              class="inline-flex items-center justify-center px-2 py-1 align-middle"
              :title="`${$t('app.voterList.remove')} [${getFullName(user)}]`"
              @click="emit('remove', user)"
            >
              <MinusIcon />
            </button>
          </div>
        </template>
      </div>
    </div>
    <div
      v-if="!isUserCsvUpload"
      class="my-1 flex w-full flex-col items-center justify-center gap-2"
    >
      <DgaUserSearch
        :admin-only="props.coadmin"
        :not-self="props.coadmin"
        class="max-w-xl flex-1"
        :placeholder="$t('app.voterList.searchUser')"
        :action-text="$t('app.voterList.addUser')"
        @select="emit('add', $event)"
      ></DgaUserSearch>
      <div class="flex flex-row gap-2">
        <DgaButton
          class="!px-4 !py-2"
          :title="$t('app.topic.csvSearch')"
          @click="csvFileInput?.click()"
        >
          {{ $t("app.topic.csvSearch") }}
        </DgaButton>
        <DgaButton
          type="button"
          class="!px-4 !py-2"
          :title="$t('app.topic.csvTemplate')"
          @click="csvTemplate?.click()"
        >
          {{ $t("app.topic.csvTemplate") }}
        </DgaButton>
        <a ref="csvTemplate" href="/searchuser-csv-template.csv" download></a>
        <input
          ref="csvFileInput"
          type="file"
          class="w-0 opacity-0"
          accept=".csv"
          @change="uploadUsersSearchCsv"
        />
      </div>
    </div>
    <div v-else class="flex flex-row justify-center">
      <span class="text-xl">{{ $t("app.loading", "Loading") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExclamationIcon from "vue-material-design-icons/Exclamation.vue";
import MinusIcon from "vue-material-design-icons/Minus.vue";

import { getPrettyFullName } from "~/src/services/formatter/user";

const props = withDefaults(
  defineProps<{
    coadmin?: boolean;
    multipleVotes?: boolean;
    users?: UserSearchTableData[];
    isUserValid?: (user: UserSearchTableData) => boolean;
    getErrorReason?: (user: UserSearchTableData) => string;
  }>(),
  {
    coadmin: false,
    multipleVotes: false,
    users: () => [],
    isUserValid: (user: UserSearchTableData) => true,
    getErrorReason: (user: UserSearchTableData) => "",
  }
);

const emit = defineEmits<{
  (e: "remove", v: UserSearchTableData): void;
  (e: "add", v: UserSearchResponseData | null): void;
  (e: "users", v: UserSearchResponseData[] | null): void;
}>();

const isUserCsvUpload = ref(false);
const csvFileInput: Ref<HTMLInputElement | null> = ref(null);
const csvTemplate: Ref<HTMLElement | null> = ref(null);

function getFullName(user: CoadminFormData) {
  return getPrettyFullName({
    ...user,
    _id: user.userid || "-",
  });
}

async function uploadUsersSearchCsv(ev: Event) {
  const target = ev.target;
  if (target instanceof HTMLInputElement) {
    if (target.files && target.files.length > 0) {
      isUserCsvUpload.value = true;

      const currentFile = target.files[0];
      const formData = new FormData();
      formData.append("csv", currentFile);

      const { data } = await useFetch("/api/users/csv-search", {
        method: "POST",
        query: props.coadmin
          ? {
              notSelf: "1",
              adminOnly: "1",
            }
          : {},
        body: formData,
        headers: { "cache-control": "no-cache" },
      });

      console;

      emit("users", data.value);
      isUserCsvUpload.value = false;
    }
  }
}
</script>

<style scoped>
.user-grid {
  @apply grid w-full items-center gap-x-4 gap-y-2 whitespace-nowrap pb-2;
  grid-template-columns: 36px 4fr 3fr 36px;
}
.user-grid.multichoice {
  grid-template-columns: 36px 4fr 3fr 2fr 36px;
}
</style>
