<template>
  <div>
    <DgaHead>{{ $t('app.admin.config.title') }}</DgaHead>
    <DgaTab v-model="currentTab" :tabs="{
      content: $t('app.admin.config.content'),
    }"></DgaTab>
    <div v-if="currentTab === 'content'" class="grid grid-cols-12 gap-4 w-full max-w-4xl mx-auto my-4">
      <div class="col-span-12 lg:col-span-3">{{ $t('app.admin.config.homeContent') }}</div>
      <DgaRichtextEditor v-model="configs.homeContentTH" class="col-span-12 lg:col-span-9"></DgaRichtextEditor>
    </div>
    <DgaButtonGroup class="mt-4">
      <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
        color="dga-orange" :title="$t('app.preferences.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
      >
        <PencilIcon />
        <span class="truncate">{{ $t('app.preferences.action') }}</span>
      </DgaButton>
    </DgaButtonGroup>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="editConfigs"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('app.admin.config.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import PencilIcon from 'vue-material-design-icons/Pencil.vue';
const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-dev",]
})
useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.admin.config.title')}`
});

const serverConfigs = await useServerConfig([
  "homeContentTH",
]);

const configs : Ref<Partial<ConfigData>> = ref({
  homeContentTH: serverConfigs.homeContentTH || "",
});
const currentTab = ref("content");
const showConfirmModal = ref(false);
const waitEdit = ref(false);


const isFormValid = computed(() => true);

async function editConfigs() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitEdit.value = true;

  const { error } = await useFetch("/api/config/update", {
    method: "POST",
    body: configs.value,
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('app.admin.config.title'),
      content: i18n.t('app.admin.config.failed'),
      autoCloseDelay: 5000,
    });
  
    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t('app.admin.config.title'),
      content: i18n.t('app.admin.config.success') ,
      autoCloseDelay: 5000,
    });

    navigateTo(localePathOf("/"))
  }
}
</script>