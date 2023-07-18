<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-3">
      {{ $t("app.preferences.topMenu.order") }}
    </div>
    <div class="col-span-12 md:col-span-9">
      <DgaTopMenuForm
        v-model="userEditFormData"
        :menu-options="allMenuOptions"
      ></DgaTopMenuForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getDefaultAdminTopMenus,
  getDefaultAllAdminTopMenus,
  getDefaultAllDevTopMenus,
  getDefaultAllTopMenus,
  getDefaultDevTopMenus,
  getDefaultTopMenus,
} from "~/src/services/form/preference";
import { checkPermissionNeeds } from "~/src/services/validations/permission";

const props = withDefaults(
  defineProps<{
    modelValue?: UserPreferencesTopMenu;
  }>(),
  {}
);

const modelValue = computed(() => props.modelValue);

const userEditFormData: Ref<UserPreferencesTopMenu> = ref(getDefaultTopMenus());
const _permissions = useSessionData().value.permissions;
if (checkPermissionNeeds(_permissions, "dev-mode")) {
  userEditFormData.value = getDefaultDevTopMenus();
} else if (checkPermissionNeeds(_permissions, "admin-mode")) {
  userEditFormData.value = getDefaultAdminTopMenus();
}

const allMenuOptions = computed(() => {
  const _permissions = useSessionData().value.permissions;
  if (checkPermissionNeeds(_permissions, "dev-mode")) {
    return getDefaultAllDevTopMenus();
  } else if (checkPermissionNeeds(_permissions, "admin-mode")) {
    return getDefaultAllAdminTopMenus();
  }
  return getDefaultAllTopMenus();
});

const emit = defineEmits<{
  (e: "update:modelValue", v: UserPreferencesTopMenu): void;
}>();

watch(
  modelValue,
  (value) => {
    if (value) {
      userEditFormData.value = value;
    }
  },
  { deep: true, immediate: true }
);

watch(
  userEditFormData,
  (value) => {
    emit("update:modelValue", value);
  },
  { deep: true }
);
</script>
