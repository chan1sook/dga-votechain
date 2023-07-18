<template>
  <div v-if="userList">
    <DgaHead>{{ $t("app.admin.user.title") }}</DgaHead>
    <div class="my-2 flex flex-col items-center gap-2 sm:flex-row">
      <DgaUserSearch
        class="w-full flex-1"
        :placeholder="$t('app.voterList.searchUser')"
        :action-text="$t('app.voterList.searchUser')"
        @select="selectUser"
      ></DgaUserSearch>
      <DgaButton
        class="flex flex-row items-center gap-2 !px-6 !py-2"
        color="dga-orange"
        :href="localePathOf('/permissions/approve')"
      >
        <AccountPlusOutlineIcon />
        {{ $t("app.requestPermissions.manageApproveList") }}
      </DgaButton>
    </div>
    <div class="mx-auto grid max-w-5xl grid-cols-12 gap-2 py-2">
      <div
        class="col-span-12 flex max-h-[600px] flex-col rounded-md border-2 border-dga-blue"
      >
        <h4 class="p-2 text-lg font-bold">{{ $t("app.admin.user.title") }}</h4>
        <div class="flex-1 overflow-y-auto border-t-2 border-dga-blue p-2">
          <div class="flex flex-col gap-2">
            <DgaUserCard
              v-if="!selectedUser"
              v-for="ele of userList"
              :role="ele.role"
              editable
              @change="toChangeUserPage(ele)"
            >
              <template #userid>#{{ ele._id }}</template>
              <template #role>
                <span v-if="ele.role">{{
                  $t(`app.role.${ele.role}`, ele.role)
                }}</span>
              </template>
              <div class="flex flex-row items-center gap-2">
                <span v-if="userNameOf(ele)">{{ userNameOf(ele) }}</span>
                <span class="italic" v-else>{{ $t("app.anonymous") }}</span>
                <span class="flex flex-1 flex-row gap-2">
                  <DgaDigitalIdIcon
                    v-if="ele.authSources?.includes('digitalId')"
                  />
                  <DgaThaIdIcon v-if="ele.authSources?.includes('thaID')" />
                </span>
              </div>
              <div class="flex flex-row items-center gap-2">
                <span class="font-bold">{{ $t("app.email") }}: </span>
                <template v-if="ele.email">{{ ele.email }}</template>
                <span class="italic" v-else>-</span>
              </div>
            </DgaUserCard>
            <template v-else>
              <DgaUserCard @change="toChangeUserPage(selectedUser)">
                <template #userid> #{{ selectedUser._id }} </template>
                <template #role>
                  <span v-if="selectedUser.role">{{
                    $t(`app.role.${selectedUser.role}`, selectedUser.role)
                  }}</span>
                </template>
                <div class="flex flex-row items-center gap-2">
                  <span v-if="userNameOf(selectedUser)">{{
                    userNameOf(selectedUser)
                  }}</span>
                  <span class="italic" v-else>{{ $t("app.anonymous") }}</span>
                  <span class="flex flex-1 flex-row gap-2">
                    <DgaDigitalIdIcon
                      v-if="selectedUser.authSources?.includes('digitalId')"
                    />
                    <DgaThaIdIcon
                      v-if="selectedUser.authSources?.includes('thaID')"
                    />
                  </span>
                </div>
                <div class="flex flex-row items-center gap-2">
                  <span class="font-bold">{{ $t("app.email") }}: </span>
                  <template v-if="selectedUser.email">{{
                    selectedUser.email
                  }}</template>
                  <span class="italic" v-else>-</span>
                </div>
              </DgaUserCard>
              <DgaButton
                color="dga-orange"
                class="mx-auto w-full max-w-sm"
                @click="selectedUser = undefined"
              >
                {{ $t("app.admin.user.showAllUsers") }}
              </DgaButton>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AccountPlusOutlineIcon from "vue-material-design-icons/AccountPlusOutline.vue";

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-dev"],
});
useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.admin.user.title"
  )}`,
});

const userList: Ref<UserSearchResponseData[] | undefined> = ref(undefined);
const selectedUser: Ref<UserSearchResponseData | undefined> = ref(undefined);

const { data: users } = await useFetch("/api/users/showall");

if (users.value) {
  userList.value = users.value;
} else {
  showError("Can't get user data");
}

function userNameOf(userData: UserSearchResponseData) {
  let name = "";
  if (userData.firstName) {
    name = userData.firstName;
    if (userData.lastName) {
      name += " " + userData.lastName;
    }
  }
  return name;
}

function selectUser(user: UserSearchResponseData | null) {
  if (user) {
    selectedUser.value = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  } else {
    useShowToast({
      title: i18n.t("app.voterList.searchUser"),
      content: i18n.t("app.voterList.error.notFound"),
      autoCloseDelay: 5000,
    });
  }
}

function toChangeUserPage(user: UserSearchResponseData) {
  navigateTo(localePathOf(`/permissions/change/${user._id}`));
}
</script>
