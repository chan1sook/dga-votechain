<template>
  <div class="text-dga-blue">
    <nav class="dga-nav top-0">
      <img src="~/assets/images/logo_dga.png" class="h-12" />
      <NuxtLink href="/" class="dga-menu-item">หน้าแรก</NuxtLink>
      <NuxtLink href="/topics" class="dga-menu-item">ร่วมโหวต</NuxtLink>
      <NuxtLink href="/about" class="dga-menu-item">เกี่ยวกับบริการ</NuxtLink>
      <NuxtLink href="/help" class="dga-menu-item">วิธีใช้งาน</NuxtLink>
      <NuxtLink href="/contact-us" class="dga-menu-item">ติดต่อเรา</NuxtLink>

      <div class="ml-auto inline-flex flex-row items-center gap-4">
        <button type="button" class="dga-small-btn" @click="toggleLanguage">
          {{ language.toUpperCase() }}
        </button>
        <DgaButton v-if="!isLogin" href="/login" theme="hollow" class="whitespace-nowrap">เข้าสู่ระบบ</DgaButton>      
        <template v-else>
          <DgaNewsDropdown></DgaNewsDropdown>
          <DgaNotifyDropdown></DgaNotifyDropdown>
          <DgaUserDropdown></DgaUserDropdown>
        </template>
      </div>
    </nav>
    <div  class="dga-container relative">
      <slot></slot>
      <div v-if="isShowCreateTopic || isShowPermissionsApprover" class="fixed bottom-8 right-8 flex flex-row gap-2 items-center">
        <DgaButton 
          v-if="isShowPermissionsApprover"
          class="flex flex-row gap-2 items-center !px-6 !py-2" color="dga-orange"
          href="/permissions/approve"
        >
        <MaterialIcon icon="how_to_reg"></MaterialIcon>
          Approve
        </DgaButton>
        <DgaButton 
          v-else-if="isShowCreateTopic"
          class="flex flex-row gap-2 items-center !px-6 !py-2" color="dga-orange"
          href="/topic/create"
        >
        <MaterialIcon icon="add_circle"></MaterialIcon>
          Create
        </DgaButton>
      </div>
    </div>
    <div>
      <div class="dga-footer-about">
        <img src="~/assets/images/logo_dga.png" class="block h-12" />
        <div>
          <p>
            สำนักงานพัฒนารัฐบาลดิจิทัล (องค์การมหาชน) (สพร.) ชั้น 17
          </p>
          <p>
            อาคารบางกอกไทยทาวเวอร์ 108 ถนนรางน้ำ แขวงถนนพญาไท เขตราชเทวี กรุงเทพ 10400
          </p>
          <p>
            โทรสาร : (+66) 02 612 6011-12 อีเมล : <a href="mailto:contact@dga.or.th">contact@dga.or.th</a>
          </p>
        </div>
      </div>
      <div class="dga-footer">Power by Digital Government Development Agency (Public Organization) (DGA) </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isLogin = computed(() => useSessionData().value.userid)
const language : Ref<"EN" | "TH"> = ref("EN");

function toggleLanguage() {
  useShowToast({
    title: "Warning",
    content: "Not Implmented yet",
    autoCloseDelay: 5000,
  });
  language.value = language.value === "EN" ? "TH" : "EN";
}

const roleMode = computed(() => useSessionData().value.roleMode);

function isRouteAllowShow() {
  return ["/", "/topics", "/about", "/help", "/contract-us"].includes(useRoute().path);
}

const isShowCreateTopic = computed(() => {
  if(roleMode.value !== 'admin') {
    return false;
  }
  return isRouteAllowShow();
})
const isShowPermissionsApprover = computed(() => {
  if(roleMode.value !== "developer") {
    return false;
  }
  return isRouteAllowShow();
})
</script>

<style scoped>
.dga-container {
  @apply min-h-[calc(100vh-14.5rem)]
}

.dga-nav {
  @apply transition duration-200 bg-white sticky top-0 h-20 border border-gray-500/25 shadow flex 
    flex-row items-center p-4 gap-4 overflow-hidden select-none hover:shadow-md z-[100];
}
.dga-nav .dga-menu-item {
  @apply transition duration-100 cursor-pointer px-2 pt-1 pb-2 border-b-4 border-transparent font-bold whitespace-nowrap hover:text-dga-orange;
}
.dga-nav .dga-menu-item.router-link-exact-active {
  @apply text-dga-orange
}

.dga-small-btn {
  @apply rounded-full border-2 border-dga-blue w-8 h-8 inline-flex items-center justify-center overflow-hidden
}

.dga-footer-about {
  @apply bg-gray-100 text-center px-4 py-4 text-sm flex flex-row gap-x-8 justify-center items-center
}
/* .dga-footer-about p {
  @apply truncate
} */

.dga-footer-menu {
  @apply flex flex-row overflow-hidden bg-dga-blue text-white
}
.dga-footer-menu .dga-menu-item {
  @apply transition duration-100 px-4 py-2 cursor-pointer text-sm whitespace-nowrap hover:text-gray-200
}
.dga-footer {
  @apply text-center px-4 py-4 text-sm font-bold truncate
}
</style>