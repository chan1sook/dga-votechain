<template>
  <div v-if="userData">
    <DgaHead>{{ $t('admin.user.title') }}</DgaHead>
    <div class="grid grid-cols-12 py-2 gap-2 mx-auto max-w-6xl">
      <div class="col-span-12 lg:col-span-8 flex flex-col border-2 border-dga-blue rounded-md max-h-[600px]">
        <h4 class="font-bold text-lg p-2">{{ $t('admin.user.title') }}</h4>
        <div class="flex-1 border-t-2 border-dga-blue p-2 overflow-y-auto">
          <div class="flex flex-col gap-2">
            <DgaUserCard v-for="ele of userData" :role="ele.role">
              <template #userid>#{{ ele._id }}</template>
              <template #role>{{ $t(`role.${ele.role}`, ele.role) }}</template>
              <div> 
                <span v-if="userNameOf(ele)">{{ userNameOf(ele) }}</span>
                <span class="italic" v-else>{{ $t("navbar.user.anonymous") }}</span>
              </div>
              <div>
                <span class="font-bold"></span>{{ $t('requestPermissions.email') }}: 
                <template v-if="ele.email">{{ ele.email }}</template>
                <span class="italic" v-else>-</span>
              </div>
            </DgaUserCard>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-admin"]
})
useHead({
  title: `${i18n.t('appName', 'Dga E-Voting')} - ${i18n.t('admin.user.title')}`
});

const userData : Ref<Array<UserShowAdminResponseData> | undefined> = ref(undefined);
const { data: users } = await useFetch("/api/user/showall");

if(users.value) {
  userData.value = users.value;
} else {
  showError("Can't get user data")
}

function userNameOf(userData: UserShowAdminResponseData) {
  let name = "";
  if(userData.firstName) {
    name = userData.firstName;
    if(userData.lastName) {
      name += " " + userData.lastName;
    }
  }
  return name;
}
</script>