<template>
  <div>
    <DgaHead>{{ $t('userPreferences.title') }}</DgaHead>
    <div class="grid grid-cols-12 gap-4 max-w-4xl mx-auto my-4">
      <div class="col-span-12 md:col-span-3">
        {{ $t('userPreferences.topMenuOrders') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <div class="grid grid-cols-12">
          <div class="col-span-5">
            <div>{{ $t('userPreferences.remainTopMenu') }}</div>
            <select v-model="selectedRemainOption" size="10" class="w-full border-2 border-dga-orange">
              <option v-for="option of remainTopMenuOptions" :value="option">
                {{ topMenuPretty(option) }}
              </option>
            </select>
          </div>
          <div class="col-span-1 flex flex-col gap-2 justify-center items-center">
            <button :title="$t('userPreferences.deselectAll')" @click="deselectTopMenuAll">
              <ChevronDoubleLeftIcon></ChevronDoubleLeftIcon>
            </button>
            <button class="disabled:text-gray-400" :title="$t('userPreferences.deselect')" :disabled="!selectedCurrentOption" @click="deselectCurrentTopMenu">
              <ChevronLeftIcon></ChevronLeftIcon>
            </button>
            <button class="disabled:text-gray-400" :title="$t('userPreferences.select')" :disabled="!selectedRemainOption" @click="selectCurrentTopMenu">
              <ChevronRightIcon></ChevronRightIcon>
            </button>
            <button :title="$t('userPreferences.selectAll')" @click="selectTopMenuAll">
              <ChevronDoubleRightIcon></ChevronDoubleRightIcon>
            </button>
          </div>
          <div class="col-span-5">
            <div>{{ $t('userPreferences.currentTopMenu') }}</div>
            <select v-model="selectedCurrentOption"  size="10" class="w-full border-2 border-dga-orange">
              <option v-for="option of currentTopMenus" :value="option">
                {{ topMenuPretty(option) }}
              </option>
            </select>
          </div>
          <div class="col-span-1 flex flex-col gap-2 justify-center items-center">
            <button :title="$t('userPreferences.moveToTop')" class="disabled:text-gray-400"
              :disabled="!selectedCurrentOption" @click="moveCurrentTopMenuToTop">
              <ChevronDoubleUpIcon></ChevronDoubleUpIcon>
            </button>
            <button :title="$t('userPreferences.moveUp')" class="disabled:text-gray-400" 
              :disabled="!selectedCurrentOption" @click="moveCurrentTopMenuUp">
              <ChevronUpIcon></ChevronUpIcon>
            </button>
            <button :title="$t('userPreferences.moveDown')" class="disabled:text-gray-400"
              :disabled="!selectedCurrentOption" @click="moveCurrentTopMenuDown">
              <ChevronDownIcon></ChevronDownIcon>
            </button>
            <button :title="$t('userPreferences.moveToBottom')" class="disabled:text-gray-400"
              :disabled="!selectedCurrentOption" @click="moveCurrentTopMenuToBottom">
              <ChevronDoubleDownIcon></ChevronDoubleDownIcon>
            </button>
          </div>
        </div>
      </div>
      <DgaButtonGroup class="col-span-12 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('app.edit')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <PencilIcon />
          <span class="truncate">{{ $t('app.edit') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </div>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="editPreferences"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('userPreferences.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import ChevronDoubleLeftIcon from 'vue-material-design-icons/ChevronDoubleLeft.vue';
import ChevronDoubleRightIcon from 'vue-material-design-icons/ChevronDoubleRight.vue';
import ChevronDoubleUpIcon from 'vue-material-design-icons/ChevronDoubleUp.vue';
import ChevronDoubleDownIcon from 'vue-material-design-icons/ChevronDoubleDown.vue';
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
import ChevronUpIcon from 'vue-material-design-icons/ChevronUp.vue';
import ChevronDownIcon from 'vue-material-design-icons/ChevronDown.vue';
import PencilIcon from 'vue-material-design-icons/Pencil.vue';
import { getDefaultAdminTopMenus, getDefaultDevTopMenus, getDefaultTopMenus } from '~/src/services/form/preference';

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-voter"]
})

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('userPreferences.title')}`
});

const preferences : Ref<UserPreferences> = ref({
  topMenus: getDefaultTopMenus(),
  adminTopMenus: getDefaultAdminTopMenus(),
  devTopMenus: getDefaultDevTopMenus(),
});


if(useSessionData().value.preferences) {
  preferences.value = Object.assign({...preferences.value}, useSessionData().value.preferences);
}

const allTopMenuOptions = computed(() => {
  switch(useSessionData().value.roleMode) {
    case "voter":
      return getDefaultTopMenus();
    case "admin":
      return getDefaultAdminTopMenus();
    case "developer":
      return getDefaultDevTopMenus();
    case "guest":
    default:
      return getDefaultTopMenus();
  }
});
const currentTopMenus = computed(() => {
  switch(useSessionData().value.roleMode) {
    case "voter":
      return preferences.value.topMenus;
    case "admin":
      return preferences.value.adminTopMenus;
    case "developer":
      return preferences.value.devTopMenus;
    case "guest":
    default:
      return getDefaultTopMenus();
  }
})
const remainTopMenuOptions = computed(() => {
  return allTopMenuOptions.value.filter((ele) => currentTopMenus.value.indexOf(ele) === -1)
});
const selectedRemainOption : Ref<PreferenceTopMenuOption | ""> = ref("");
const selectedCurrentOption : Ref<PreferenceTopMenuOption | ""> = ref("");


const showConfirmModal = ref(false);
const waitEdit = ref(false);
const isFormValid = computed(() => true);

function topMenuPretty(menu: PreferenceTopMenuOption) {
  switch(menu) {
    case "home":
      return i18n.t("app.navbar.home")
    case "voting":
      return i18n.t("app.navbar.voting")
    case "about":
      return i18n.t("app.navbar.about")
    case "help":
      return i18n.t("app.navbar.help")
    case "contact-us":
      return i18n.t("app.navbar.contactUs")
    case "users-management":
      return i18n.t("app.navbar.adminShowUsers")
    case "blockchain":
      return i18n.t("app.navbar.blockchain")
    default:
      return menu;
  }
}

function deselectTopMenuAll() {
  switch(useSessionData().value.roleMode) {
    case "voter":
      preferences.value.topMenus = [];
    case "admin":
      preferences.value.adminTopMenus = [];
    case "developer":
      preferences.value.devTopMenus = [];
  }
}

function deselectCurrentTopMenu() {
  const value = selectedCurrentOption.value;
  if(!value) {
    return;
  }

  const index = getIndexOfCurrentTopMenu(value);
  switch(useSessionData().value.roleMode) {
    case "voter":
      if(index !== -1) {
        preferences.value.topMenus.splice(index, 1);
      }
      break;
    case "admin":
      if(index !== -1) {
        preferences.value.adminTopMenus.splice(index, 1);
      }
      break;
    case "developer":
      if(index !== -1) {
        preferences.value.adminTopMenus.splice(index, 1);
      }
      break;
  }

}

function selectTopMenuAll() {
  let inseredIndex = currentTopMenus.value.length;
  
  const value = selectedCurrentOption.value;
  if(value) {
    inseredIndex = getIndexOfCurrentTopMenu(value);
    if(inseredIndex <= -1 || inseredIndex >= currentTopMenus.value.length) {
      inseredIndex = currentTopMenus.value.length;
    }
  }
  for(const menu of allTopMenuOptions.value) {
    const index = getIndexOfCurrentTopMenu(menu);
    if(index === -1) {
      switch(useSessionData().value.roleMode) {
        case "voter":
          preferences.value.topMenus.splice(inseredIndex, 0, menu);
        case "admin":
          preferences.value.adminTopMenus.splice(inseredIndex, 0, menu);
        case "developer":
          preferences.value.devTopMenus.splice(inseredIndex, 0, menu);
      }
      inseredIndex += 1;
    }
  }
}

function selectCurrentTopMenu() {
  const value = selectedRemainOption.value;
  if(!value) {
    return;
  }

  const index = getIndexOfCurrentTopMenu(value);
  let inseredIndex = index;
  if(inseredIndex <= -1 || inseredIndex >= currentTopMenus.value.length) {
    inseredIndex = currentTopMenus.value.length;
  }
  
  switch(useSessionData().value.roleMode) {
    case "voter":
      if(index === -1) {
        preferences.value.topMenus.splice(inseredIndex, 0, value);
      }
      break;
    case "admin":
      if(index === -1) {
        preferences.value.adminTopMenus.splice(inseredIndex, 0, value);
      }
      break;
    case "developer":
      if(index === -1) {
        preferences.value.adminTopMenus.splice(inseredIndex, 0, value);
      }
      break;
  }
}

function getIndexOfCurrentTopMenu(value: PreferenceTopMenuOption | "") {
  if(!value) {
    return -1;
  }

  return currentTopMenus.value.indexOf(value);
}

function moveCurrentTopMenuToPosition(i: number) {
  const value = selectedCurrentOption.value;
  if(!value) {
    return;
  }
  
  const oldIndex = getIndexOfCurrentTopMenu(value);
  if(oldIndex !== -1) {
    switch(useSessionData().value.roleMode) {
      case "voter":
        preferences.value.topMenus.splice(oldIndex, 1);
        break;
      case "admin":
        preferences.value.adminTopMenus.splice(oldIndex, 1);
        break;
      case "developer":
        preferences.value.adminTopMenus.splice(oldIndex, 1);
        break;
    }
  }

  let inseredIndex = i;
  if(inseredIndex <= -1 || inseredIndex >= currentTopMenus.value.length) {
    inseredIndex = currentTopMenus.value.length;
  }
  
  switch(useSessionData().value.roleMode) {
    case "voter":
      preferences.value.topMenus.splice(inseredIndex, 0, value);
      break;
    case "admin":
      preferences.value.adminTopMenus.splice(inseredIndex, 0, value);
      break;
    case "developer":
      preferences.value.adminTopMenus.splice(inseredIndex, 0, value);
      break;
  }
}

function moveCurrentTopMenuToTop() {
  return moveCurrentTopMenuToPosition(0);
}

function moveCurrentTopMenuUp() {
  const value = selectedCurrentOption.value;
  if(!value) {
    return;
  }

  const index = getIndexOfCurrentTopMenu(value);
  return moveCurrentTopMenuToPosition(index - 1);
}

function moveCurrentTopMenuDown() {
  const value = selectedCurrentOption.value;
  if(!value) {
    return;
  }

  const index = getIndexOfCurrentTopMenu(value);
  return moveCurrentTopMenuToPosition(index + 1);
}


function moveCurrentTopMenuToBottom() {
  return moveCurrentTopMenuToPosition(currentTopMenus.value.length);
}

async function editPreferences() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitEdit.value = true;

  const { error } = await useFetch("/api/user/edit-pref", {
    method: "POST",
    body: {
      preferences: preferences.value,
    }
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('userPreferences.title'),
      content: i18n.t('userPreferences.failed'),
      autoCloseDelay: 5000,
    });
  
    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t('userPreferences.title'),
      content: i18n.t('userPreferences.success') ,
      autoCloseDelay: 5000,
    });

    navigateTo(localePathOf("/"))
  }
}
</script>