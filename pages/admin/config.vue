<template>
  <div>
    <DgaHead>{{ $t("app.admin.config.title") }}</DgaHead>
    <DgaTab
      v-model="currentTab"
      :tabs="{
        content: $t('app.admin.config.content'),
      }"
      class="mt-2"
    ></DgaTab>
    <div
      v-if="currentTab === 'content'"
      class="mx-auto my-4 flex w-full flex-col gap-4"
    >
      <div class="mx-auto flex w-full max-w-md flex-row items-center gap-x-2">
        <div>
          {{ $t("app.admin.config.language") }}
        </div>
        <DgaVueSelect
          v-model="langFilter"
          class="flex-1"
          :options="langOptions"
          :reduce="(lang) => lang.value"
        ></DgaVueSelect>
      </div>
      <DgaTab
        v-model="contentSubtab"
        :tabs="{
          home: $t('app.home.title'),
          about: $t('app.about.title'),
          contactUs: $t('app.contactUs.title'),
          cookiePolicy: $t('app.cookiePolicy'),
          privacyPolicy: $t('app.privacyPolicy'),
          help: $t('app.help.title'),
        }"
      ></DgaTab>
      <div v-show="contentSubtab === 'home'" class="grid grid-cols-12 gap-4">
        <div class="col-span-12 lg:col-span-3">
          {{ $t("app.admin.config.homeTitleContent") }} ({{
            langFilter.toUpperCase()
          }})
        </div>
        <DgaRichtextEditor
          v-show="langFilter === 'th'"
          v-model="configs.homeTitleContentTH"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
        <DgaRichtextEditor
          v-show="langFilter === 'en'"
          v-model="configs.homeTitleContentEN"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>

        <div class="col-span-12 lg:col-span-3">
          {{ $t("app.admin.config.homeImageUrl") }} ({{
            langFilter.toUpperCase()
          }})
        </div>
        <div class="col-span-12 flex flex-col lg:col-span-9">
          <DgaInput
            v-show="langFilter === 'th'"
            v-model="configs.homeImageUrlTH"
            :placeholder="$t('app.admin.config.homeImageUrlPlaceholder')"
          ></DgaInput>
          <DgaInput
            v-show="langFilter === 'en'"
            v-model="configs.homeImageUrlEN"
            :placeholder="$t('app.admin.config.homeImageUrlPlaceholder')"
          ></DgaInput>
          <div class="font-bold">
            {{ $t("app.admin.config.homeImageUrlPreview") }}:
          </div>
          <img
            v-show="langFilter === 'th'"
            :src="configs.homeImageUrlTH || HOME_IMAGE_URL_TH"
            class="mx-auto max-h-[200px] max-w-[400px] border"
          />
          <img
            v-show="langFilter === 'en'"
            :src="configs.homeImageUrlEN || HOME_IMAGE_URL_TH"
            class="mx-auto max-h-[200px] max-w-[400px] border"
          />
        </div>
        <div class="col-span-12 lg:col-span-3">
          {{ $t("app.admin.config.homeContent") }} ({{
            langFilter.toUpperCase()
          }})
        </div>
        <DgaRichtextEditor
          v-show="langFilter === 'th'"
          v-model="configs.homeContentTH"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
        <DgaRichtextEditor
          v-show="langFilter === 'en'"
          v-model="configs.homeContentEN"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
      </div>
      <div v-show="contentSubtab === 'about'" class="grid grid-cols-12 gap-4">
        <div class="col-span-12 lg:col-span-3">
          {{ $t("app.admin.config.aboutContent") }} ({{
            langFilter.toUpperCase()
          }})
        </div>
        <DgaRichtextEditor
          v-show="langFilter === 'th'"
          v-model="configs.aboutTH"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
        <DgaRichtextEditor
          v-show="langFilter === 'en'"
          v-model="configs.aboutEN"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
      </div>
      <div
        v-show="contentSubtab === 'contactUs'"
        class="grid grid-cols-12 gap-4"
      >
        <div class="col-span-12 lg:col-span-3">
          {{ $t("app.admin.config.contactUsContent") }} ({{
            langFilter.toUpperCase()
          }})
        </div>
        <DgaRichtextEditor
          v-show="langFilter === 'th'"
          v-model="configs.contactUsTH"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
        <DgaRichtextEditor
          v-show="langFilter === 'en'"
          v-model="configs.contactUsEN"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
      </div>
      <div
        v-show="contentSubtab === 'cookiePolicy'"
        class="grid grid-cols-12 gap-4"
      >
        <div class="col-span-12 lg:col-span-3">
          {{ $t("app.admin.config.cookiePolicyContent") }} ({{
            langFilter.toUpperCase()
          }})
        </div>
        <DgaRichtextEditor
          v-show="langFilter === 'th'"
          v-model="configs.cookiePolicyTH"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
        <DgaRichtextEditor
          v-show="langFilter === 'en'"
          v-model="configs.cookiePolicyEN"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
      </div>
      <div
        v-show="contentSubtab === 'privacyPolicy'"
        class="grid grid-cols-12 gap-4"
      >
        <div class="col-span-12 lg:col-span-3">
          {{ $t("app.admin.config.privacyPolicyContent") }} ({{
            langFilter.toUpperCase()
          }})
        </div>
        <DgaRichtextEditor
          v-show="langFilter === 'th'"
          v-model="configs.privacyPolicyTH"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
        <DgaRichtextEditor
          v-show="langFilter === 'en'"
          v-model="configs.privacyPolicyEN"
          class="col-span-12 lg:col-span-9"
        ></DgaRichtextEditor>
      </div>
      <div v-show="contentSubtab === 'help'" class="grid grid-cols-12 gap-4">
        <div class="col-span-12 lg:col-span-3">
          {{ $t("app.admin.config.helpPdfContent") }} ({{
            langFilter.toUpperCase()
          }})
        </div>

        <div
          v-show="langFilter === 'th'"
          class="col-span-12 flex flex-row gap-2 lg:col-span-9"
        >
          <DgaInput
            class="flex-1"
            readonly
            :value="helpPdfFileTH ? helpPdfFileTH.name : configs.helpPdfTH"
          ></DgaInput>
          <DgaPdfPicker v-model="helpPdfFileTH"></DgaPdfPicker>
        </div>
        <div
          v-show="langFilter === 'en'"
          class="col-span-12 flex flex-row gap-2 lg:col-span-9"
        >
          <DgaInput
            readonly
            :value="helpPdfFileEN ? helpPdfFileEN.name : configs.helpPdfEN"
          ></DgaInput>
          <DgaPdfPicker v-model="helpPdfFileEN"></DgaPdfPicker>
        </div>
      </div>
    </div>
    <DgaButtonGroup class="mt-4">
      <DgaButton
        class="!flex flex-row items-center justify-center gap-x-2 truncate"
        color="dga-orange"
        :title="$t('app.preferences.action')"
        :disabled="!isFormValid"
        @click="showConfirmModal = true"
      >
        <PencilIcon />
        <span class="truncate">{{ $t("app.preferences.action") }}</span>
      </DgaButton>
    </DgaButtonGroup>
    <DgaModal
      :show="showConfirmModal"
      cancel-backdrop
      @confirm="editConfigs"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t("app.admin.config.confirm") }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import PencilIcon from "vue-material-design-icons/Pencil.vue";
import { HOME_IMAGE_URL_TH } from "~/src/defaults";
import { mapConfigKeysToAllLocales } from "~/src/services/transform/config";
const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-dev"],
});
useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.admin.config.title"
  )}`,
});

const serverConfigs = await useServerConfig(
  mapConfigKeysToAllLocales(
    "homeTitleContent",
    "homeContent",
    "about",
    "contactUs",
    "cookiePolicy",
    "privacyPolicy",
    "helpPdf"
  ).concat(["homeImageURL"])
);

const configs: Ref<Partial<ConfigData>> = ref({
  homeTitleContentEN: serverConfigs.homeTitleContentEN || "",
  homeTitleContentTH: serverConfigs.homeTitleContentTH || "",
  homeImageUrlEN: serverConfigs.homeImageUrlEN || "",
  homeImageUrlTH: serverConfigs.homeImageUrlTH || "",
  homeContentEN: serverConfigs.homeContentEN || "",
  homeContentTH: serverConfigs.homeContentTH || "",
  aboutEN: serverConfigs.aboutEN || "",
  aboutTH: serverConfigs.aboutTH || "",
  contactUsEN: serverConfigs.contactUsEN || "",
  contactUsTH: serverConfigs.contactUsTH || "",
  cookiePolicyTH: serverConfigs.cookiePolicyTH || "",
  cookiePolicyEN: serverConfigs.cookiePolicyEN || "",
  privacyPolicyTH: serverConfigs.privacyPolicyTH || "",
  privacyPolicyEN: serverConfigs.privacyPolicyEN || "",
  helpPdfTH: serverConfigs.helpPdfTH || "",
  helpPdfEN: serverConfigs.helpPdfEN || "",
});

const helpPdfFileTH: Ref<File | undefined> = ref(undefined);
const helpPdfFileEN: Ref<File | undefined> = ref(undefined);

const currentTab = ref("content");
const contentSubtab = ref("home");
const langFilter = ref(i18n.locale.value);
const showConfirmModal = ref(false);
const waitEdit = ref(false);

const isFormValid = computed(() => true);

const langOptions = computed(() => {
  return [
    { label: "ไทย", value: "th" },
    { label: "English", value: "en" },
  ];
});
async function editConfigs() {
  if (!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitEdit.value = true;

  if (helpPdfFileTH.value != null) {
    const formData = new FormData();
    formData.append("pdf", helpPdfFileTH.value);

    const { data } = await useFetch("/api/help-manual/upload", {
      method: "POST",
      body: formData,
      headers: { "cache-control": "no-cache" },
    });

    if (data.value) {
      configs.value.helpPdfTH = "/api/help-manual/" + data.value.fileName;
    }
  }

  if (helpPdfFileEN.value != null) {
    const formData = new FormData();
    formData.append("pdf", helpPdfFileEN.value);

    const { data } = await useFetch("/api/help-manual/upload", {
      method: "POST",
      body: formData,
      headers: { "cache-control": "no-cache" },
    });

    if (data.value) {
      configs.value.helpPdfEN = "/api/help-manual/" + data.value.fileName;
    }
  }

  const { error } = await useFetch("/api/config/update", {
    method: "POST",
    body: configs.value,
  });

  if (error.value) {
    useShowToast({
      title: i18n.t("app.admin.config.title"),
      content: i18n.t("app.admin.config.failed"),
      autoCloseDelay: 5000,
    });

    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t("app.admin.config.title"),
      content: i18n.t("app.admin.config.success"),
      autoCloseDelay: 5000,
    });

    navigateTo(localePathOf("/"));
  }
}
</script>
