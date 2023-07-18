<template>
  <div class="my-1 flex w-full flex-row items-center justify-center gap-2">
    <DgaInput
      v-model="keyword"
      type="search"
      class="w-0 max-w-xl flex-1"
      :placeholder="props.placeholder"
    ></DgaInput>
    <DgaButton
      :title="props.actionText"
      color="dga-orange"
      class="whitespace-nowrap !px-4 !py-2"
      @click="searchUser"
    >
      <span class="hidden sm:block">{{ props.actionText }}</span>
      <MagnifyIcon class="sm:hidden" />
    </DgaButton>
  </div>
</template>

<script setup lang="ts">
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    actionText?: string;
    adminOnly?: boolean;
    notSelf?: boolean;
  }>(),
  {
    actionText: "Search",
  }
);

const keyword = ref("");
const isSearching = ref(false);

async function searchUser() {
  if (isSearching.value) {
    return;
  }

  isSearching.value = true;
  const { data } = await useFetch("/api/users/search", {
    query: {
      keyword: keyword.value,
      adminOnly: props.adminOnly ? "1" : undefined,
      notSelf: props.notSelf ? "1" : undefined,
    },
  });

  emit("select", data.value);

  isSearching.value = false;
  keyword.value = "";
}

const emit = defineEmits<{
  (e: "select", v: UserSearchResponseData | null): boolean;
}>();
</script>
