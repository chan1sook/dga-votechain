<template>
  <div v-if="userList">
    <DgaHead>{{ $t('admin.user.title') }}</DgaHead>
    <div class="flex flex-col sm:flex-row gap-2 items-center my-2">
      <DgaUserSearch class="flex-1 w-full"
        :placeholder="$t('app.voterList.searchUser')" :action-text="$t('app.voterList.searchUser')"
        @select="selectUser"
      ></DgaUserSearch>
      <DgaButton 
        class="flex flex-row gap-2 items-center !px-6 !py-2" color="dga-orange"
        :href="localePathOf('/permissions/approve')"
      >
        <AccountPlusOutlineIcon />
        {{ $t('app.requestPermissions.manageApproveList') }}
      </DgaButton>
    </div>
    <div class="grid grid-cols-12 py-2 gap-2 mx-auto max-w-5xl">
      <div class="col-span-12 flex flex-col border-2 border-dga-blue rounded-md max-h-[600px]">
        <h4 class="font-bold text-lg p-2">{{ $t('admin.user.title') }}</h4>
        <div class="flex-1 border-t-2 border-dga-blue p-2 overflow-y-auto">
          <div class="flex flex-col gap-2">
            <DgaUserCard v-if="!selectedUser" v-for="ele of userList" :role="ele.role" editable @change="toChangeUserPage(ele)">
              <template #userid>#{{ ele._id }}</template>
              <template #role>
                <span v-if="ele.role">{{ $t(`role.${ele.role}`, ele.role) }}</span>
              </template>
              <div> 
                <span v-if="userNameOf(ele)">{{ userNameOf(ele) }}</span>
                <span class="italic" v-else>{{ $t("app.navbar.user.anonymous") }}</span>
              </div>
              <div>
                <span class="font-bold"></span>{{ $t('app.email') }}: 
                <template v-if="ele.email">{{ ele.email }}</template>
                <span class="italic" v-else>-</span>
              </div>
            </DgaUserCard>
            <template v-else>
              <DgaUserCard @change="toChangeUserPage(selectedUser)">
                <template #userid>#{{ selectedUser._id }}</template>
                <template #role>
                  <span v-if="selectedUser.role">{{ $t(`role.${selectedUser.role}`, selectedUser.role) }}</span>
                </template>
                <div> 
                  <span v-if="userNameOf(selectedUser)">{{ userNameOf(selectedUser) }}</span>
                  <span class="italic" v-else>{{ $t("app.navbar.user.anonymous") }}</span>
                </div>
                <div>
                  <span class="font-bold"></span>{{ $t('app.email') }}: 
                  <template v-if="selectedUser.email">{{ selectedUser.email }}</template>
                  <span class="italic" v-else>-</span>
                </div>
              </DgaUserCard>
              <DgaButton color="dga-orange"  class="w-full mx-auto max-w-sm" @click="selectedUser = undefined">
                {{ $t('admin.user.showAllUsers') }}
              </DgaButton>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AccountPlusOutlineIcon from 'vue-material-design-icons/AccountPlusOutline.vue';

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-dev"]
})
useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('admin.user.title')}`
});

const userList : Ref<UserSearchResponseData[] | undefined> = ref(undefined);
const selectedUser : Ref<UserSearchResponseData | undefined> = ref(undefined);

const { data: users } = await useFetch("/api/users/showall");

if(users.value) {
  userList.value = users.value;
} else {
  showError("Can't get user data")
}

function userNameOf(userData: UserSearchResponseData) {
  let name = "";
  if(userData.firstName) {
    name = userData.firstName;
    if(userData.lastName) {
      name += " " + userData.lastName;
    }
  }
  return name;
}

function selectUser(user: UserSearchResponseData | null) {
  if(user) {
    selectedUser.value = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  } else {
    useShowToast({
      title: i18n.t('app.voterList.searchUser'),
      content: i18n.t('app.voterList.error.notFound'),
      autoCloseDelay: 5000,
    });
  }
}

function toChangeUserPage(user: UserSearchResponseData) {
  navigateTo(localePathOf(`/permissions/change/${user._id}`));
}
</script>