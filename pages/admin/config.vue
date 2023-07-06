<template>
  <div>
    <DgaHead>{{ $t('app.admin.config.title') }}</DgaHead>
    <DgaTab v-model="currentTab" :tabs="{
      content: $t('app.admin.config.content'),
    }" class="mt-2"></DgaTab>
    <div v-if="currentTab === 'content'" class="grid grid-cols-12 gap-4 w-full max-w-4xl mx-auto my-4">
      <DgaTab v-model="contentSubtab" :tabs="{
        home: $t('app.home.title'),
        about: $t('app.about.title'),
        contactUs: $t('app.contactUs.title'),
      }" class="col-span-12"></DgaTab>
      <template v-if="contentSubtab === 'home'">
        <div class="col-span-12 lg:col-span-3">
          {{ $t('app.admin.config.homeContent') }} (TH)
        </div>
        <DgaRichtextEditor v-model="configs.homeContentTH" class="col-span-12 lg:col-span-9"></DgaRichtextEditor>
        <div class="col-span-12 lg:col-span-3">
          {{ $t('app.admin.config.homeContent') }} (EN)
        </div>
        <DgaRichtextEditor v-model="configs.homeContentEN" class="col-span-12 lg:col-span-9"></DgaRichtextEditor>
      </template>
      <template v-else-if="contentSubtab === 'about'">
        <div class="col-span-12 lg:col-span-3">
          {{ $t('app.admin.config.aboutContent') }} (TH)
        </div>
        <DgaRichtextEditor v-model="configs.aboutTH" class="col-span-12 lg:col-span-9"></DgaRichtextEditor>
        <div class="col-span-12 lg:col-span-3">
          {{ $t('app.admin.config.aboutContent') }} (EN)
        </div>
        <DgaRichtextEditor v-model="configs.aboutEN" class="col-span-12 lg:col-span-9"></DgaRichtextEditor>
      </template>
      <template v-else-if="contentSubtab === 'contactUs'">
        <div class="col-span-12 lg:col-span-3">
          {{ $t('app.admin.config.contactUsContent') }} (TH)
        </div>
        <DgaRichtextEditor v-model="configs.contactUsTH" class="col-span-12 lg:col-span-9"></DgaRichtextEditor>
        <div class="col-span-12 lg:col-span-3">
          {{ $t('app.admin.config.contactUsContent') }} (EN)
        </div>
        <DgaRichtextEditor v-model="configs.contactUsEN" class="col-span-12 lg:col-span-9"></DgaRichtextEditor>
      </template>
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
  "homeContentEN",
  "homeContentTH",
  "aboutEN",
  "aboutTH",
  "contactUsEN",
  "contactUsTH",
]);

const configs : Ref<Partial<ConfigData>> = ref({
  homeContentEN: serverConfigs.homeContentEN || "",
  homeContentTH: serverConfigs.homeContentTH || "",
  aboutEN: serverConfigs.aboutEN || "",
  aboutTH: serverConfigs.aboutTH || "",
  contactUsEN: serverConfigs.contactUsEN || "",
  contactUsTH: serverConfigs.contactUsTH || "",
});
const currentTab = ref("content");
const contentSubtab = ref("home");
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