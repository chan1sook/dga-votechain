<template>
  <div class="dga-container-root text-dga-blue">
    <DgaNav></DgaNav>
    <div class="dga-container flex-1 relative overflow-auto">
      <slot></slot>
      <div v-if="isShowPermissionsApprover" class="fixed bottom-8 right-8 flex flex-row gap-2 items-center">
        <DgaButton 
          v-if="isShowPermissionsApprover"
          class="flex flex-row gap-2 items-center !px-6 !py-2" color="dga-orange"
          :href="localePathOf('/permissions/approve')"
        >
        <MaterialIcon icon="how_to_reg"></MaterialIcon>
          {{ $t('requestPermissions.approve') }}
        </DgaButton>
      </div>
    </div>
    <DgaFooter></DgaFooter>
  </div>
</template>

<script setup lang="ts">
const localePathOf = useLocalePath();
const roleMode = computed(() => useSessionData().value.roleMode);

function isRouteAllowShow() {
  return ["/", "/topics", "/about", "/help", "/contract-us"].includes(useRoute().path);
}

const isShowPermissionsApprover = computed(() => {
  if(roleMode.value !== "developer") {
    return false;
  }
  return isRouteAllowShow();
})
</script>

<style scoped>
.dga-container-root {
  @apply min-h-screen flex flex-col
}
</style>