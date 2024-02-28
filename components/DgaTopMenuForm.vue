<template>
  <div class="grid grid-cols-12">
    <div class="col-span-5">
      <div>{{ $t("app.preferences.topMenu.remainTopMenu") }}</div>
      <select
        v-model="selectedRemainOption"
        size="10"
        class="w-full border-2 border-dga-orange"
      >
        <option v-for="option of remainTopMenuOptions" :value="option">
          {{ topMenuPretty(option) }}
        </option>
      </select>
    </div>
    <div class="col-span-1 flex flex-col items-center justify-center gap-2">
      <button :title="$t('app.deselectAll')" @click="deselectTopMenuAll">
        <ChevronDoubleLeftIcon></ChevronDoubleLeftIcon>
      </button>
      <button
        class="disabled:text-gray-400"
        :title="$t('app.deselect')"
        :disabled="!selectedCurrentOption"
        @click="deselectCurrentTopMenu"
      >
        <ChevronLeftIcon></ChevronLeftIcon>
      </button>
      <button
        class="disabled:text-gray-400"
        :title="$t('app.select')"
        :disabled="!selectedRemainOption"
        @click="selectCurrentTopMenu"
      >
        <ChevronRightIcon></ChevronRightIcon>
      </button>
      <button :title="$t('app.selectAll')" @click="selectTopMenuAll">
        <ChevronDoubleRightIcon></ChevronDoubleRightIcon>
      </button>
    </div>
    <div class="col-span-5">
      <div>{{ $t("app.preferences.topMenu.currentTopMenu") }}</div>
      <select
        v-model="selectedCurrentOption"
        size="10"
        class="w-full border-2 border-dga-orange"
      >
        <option v-for="option of currentTopMenus" :value="option">
          {{ topMenuPretty(option) }}
        </option>
      </select>
    </div>
    <div class="col-span-1 flex flex-col items-center justify-center gap-2">
      <button
        :title="$t('app.moveToTop')"
        class="disabled:text-gray-400"
        :disabled="!selectedCurrentOption"
        @click="moveCurrentTopMenuToTop"
      >
        <ChevronDoubleUpIcon></ChevronDoubleUpIcon>
      </button>
      <button
        :title="$t('app.moveUp')"
        class="disabled:text-gray-400"
        :disabled="!selectedCurrentOption"
        @click="moveCurrentTopMenuUp"
      >
        <ChevronUpIcon></ChevronUpIcon>
      </button>
      <button
        :title="$t('app.moveDown')"
        class="disabled:text-gray-400"
        :disabled="!selectedCurrentOption"
        @click="moveCurrentTopMenuDown"
      >
        <ChevronDownIcon></ChevronDownIcon>
      </button>
      <button
        :title="$t('app.moveToBottom')"
        class="disabled:text-gray-400"
        :disabled="!selectedCurrentOption"
        @click="moveCurrentTopMenuToBottom"
      >
        <ChevronDoubleDownIcon></ChevronDoubleDownIcon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronDoubleLeftIcon from "vue-material-design-icons/ChevronDoubleLeft.vue";
import ChevronDoubleRightIcon from "vue-material-design-icons/ChevronDoubleRight.vue";
import ChevronDoubleUpIcon from "vue-material-design-icons/ChevronDoubleUp.vue";
import ChevronDoubleDownIcon from "vue-material-design-icons/ChevronDoubleDown.vue";
import ChevronLeftIcon from "vue-material-design-icons/ChevronLeft.vue";
import ChevronRightIcon from "vue-material-design-icons/ChevronRight.vue";
import ChevronUpIcon from "vue-material-design-icons/ChevronUp.vue";
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";

import { getDefaultTopMenus } from "~/src/services/form/preference";

const props = withDefaults(
  defineProps<{
    modelValue?: PreferenceTopMenuOption[];
    menuOptions?: PreferenceTopMenuOption[];
  }>(),
  {
    menuOptions: () => getDefaultTopMenus(),
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: PreferenceTopMenuOption[]): void;
}>();

const i18n = useI18n();

const currentTopMenus: Ref<PreferenceTopMenuOption[]> = ref([]);
const selectedRemainOption: Ref<PreferenceTopMenuOption | ""> = ref("");
const selectedCurrentOption: Ref<PreferenceTopMenuOption | ""> = ref("");
const modelValue = computed(() => props.modelValue);

const remainTopMenuOptions = computed(() => {
  return props.menuOptions.filter(
    (ele) => currentTopMenus.value.indexOf(ele) === -1
  );
});

watch(
  modelValue,
  (value) => {
    if (value) {
      currentTopMenus.value = value;
    }
  },
  { deep: true, immediate: true }
);

watch(
  currentTopMenus,
  (value) => {
    emit("update:modelValue", value);
  },
  { deep: true }
);

function topMenuPretty(menu: PreferenceTopMenuOption) {
  switch (menu) {
    case "home":
      return i18n.t("app.home.title");
    case "voting":
      return i18n.t("app.voting.title");
    case "about":
      return i18n.t("app.about.title");
    case "help":
      return i18n.t("app.help.title");
    case "contact-us":
      return i18n.t("app.contactUs.title");
    case "users-management":
      return i18n.t("app.navbar.adminShowUsers");
    case "blockchain":
      return i18n.t("app.navbar.blockchain");
    case "server-config":
      return i18n.t("app.admin.config.title");
    case "monitor":
      return i18n.t("app.admin.monitor.title");
    default:
      return menu;
  }
}

function deselectTopMenuAll() {
  currentTopMenus.value = [];
}

function deselectCurrentTopMenu() {
  const value = selectedCurrentOption.value;
  if (!value) {
    return;
  }

  const index = getIndexOfCurrentTopMenu(value);
  if (index !== -1) {
    currentTopMenus.value.splice(index, 1);
  }
}

function selectTopMenuAll() {
  let inseredIndex = currentTopMenus.value.length;

  const value = selectedCurrentOption.value;
  if (value) {
    inseredIndex = getIndexOfCurrentTopMenu(value);
    if (inseredIndex <= -1 || inseredIndex >= currentTopMenus.value.length) {
      inseredIndex = currentTopMenus.value.length;
    }
  }
  for (const menu of props.menuOptions) {
    const index = getIndexOfCurrentTopMenu(menu);
    if (index === -1) {
      currentTopMenus.value.splice(inseredIndex, 0, menu);
      inseredIndex += 1;
    }
  }
}

function selectCurrentTopMenu() {
  const value = selectedRemainOption.value;
  if (!value) {
    return;
  }

  const index = getIndexOfCurrentTopMenu(value);
  let inseredIndex = index;
  if (inseredIndex <= -1 || inseredIndex >= currentTopMenus.value.length) {
    inseredIndex = currentTopMenus.value.length;
  }

  if (index === -1) {
    currentTopMenus.value.splice(inseredIndex, 0, value);
  }
}

function getIndexOfCurrentTopMenu(value: PreferenceTopMenuOption | "") {
  if (!value) {
    return -1;
  }

  return currentTopMenus.value.indexOf(value);
}

function moveCurrentTopMenuToPosition(i: number) {
  const value = selectedCurrentOption.value;
  if (!value) {
    return;
  }

  const oldIndex = getIndexOfCurrentTopMenu(value);
  if (oldIndex !== -1) {
    currentTopMenus.value.splice(oldIndex, 1);
  }

  let inseredIndex = i;
  if (inseredIndex <= -1 || inseredIndex >= currentTopMenus.value.length) {
    inseredIndex = currentTopMenus.value.length;
  }

  currentTopMenus.value.splice(inseredIndex, 0, value);
}

function moveCurrentTopMenuToTop() {
  return moveCurrentTopMenuToPosition(0);
}

function moveCurrentTopMenuUp() {
  const value = selectedCurrentOption.value;
  if (!value) {
    return;
  }

  const index = getIndexOfCurrentTopMenu(value);
  return moveCurrentTopMenuToPosition(index - 1);
}

function moveCurrentTopMenuDown() {
  const value = selectedCurrentOption.value;
  if (!value) {
    return;
  }

  const index = getIndexOfCurrentTopMenu(value);
  return moveCurrentTopMenuToPosition(index + 1);
}

function moveCurrentTopMenuToBottom() {
  return moveCurrentTopMenuToPosition(currentTopMenus.value.length);
}
</script>
