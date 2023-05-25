<template>
  <div class="relative">
    <input v-model="keyword" type="search" :placeholder="props.placeholder"
      class="dga-user-search w-full" :class="[ popupShow && searchedUsers.length > 0 ? '!rounded-b-none' : '']" @input="searchUsers"/>
    <div v-if="popupShow && searchedUsers.length > 0" class="z-[600] absolute w-full p-2 bg-white flex flex-col gap-2 rounded-b-2xl border-2 border-dga-orange">
      <button class="text-left block w-full" v-for="user of searchedUsers" @click="selectUser(user)">{{ getVoterName(user) }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  placeholder?: string,
  adminOnly? : boolean,
  notSelf? : boolean,
}>(), {});


const keyword = ref("");
const isSearching = ref(false);
const popupShow = ref(false);
const searchedUsers : Ref<Array<UserSearchResponseData>> = ref([]);

async function searchUsers() {
  if(isSearching.value) {
    return;
  }

  popupShow.value = false;
  isSearching.value = true;
  const { data } = await useFetch("/api/user/search", { query: {
    keyword: keyword.value,
    adminOnly: props.adminOnly ? "1" : undefined,
    notSelf: props.notSelf ? "1" : undefined,
  }})
  if(data.value) {
    searchedUsers.value = data.value;
  }

  isSearching.value = false;
  popupShow.value = true;
}

function selectUser(user: UserSearchResponseData) {
  popupShow.value = false;
  emit('select', user);
  keyword.value = "";
}

const emit = defineEmits<{
  (e: "select", v: UserSearchResponseData) : boolean,
}>();

  
function getVoterName(voter: UserSearchResponseData) {
  if(voter.firstName) {
    return voter.lastName ? `${voter.firstName} ${voter.lastName}` : voter.firstName;
  }
  return voter._id
}

onMounted(() => {
  document.body.addEventListener("click", () => {
    popupShow.value = false;
  })
})

</script>

<style scoped>
.dga-user-search {
  @apply transition duration-200 text-dga-orange border-2 border-dga-orange placeholder:text-dga-orange/50 rounded-2xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-dga-orange/50;
}
</style>