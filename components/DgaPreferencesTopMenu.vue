<template>
  <div>
    <div class="col-span-12 md:col-span-3">
      {{ $t('app.preferences.topMenu.voter') }}
    </div>
    <div class="col-span-12 md:col-span-9">
      <DgaTopMenuForm v-model="userEditFormData.voter" :menu-options="getDefaultTopMenus()"></DgaTopMenuForm>
    </div>
    <template v-if="isAdmin">
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.preferences.topMenu.admin') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaTopMenuForm v-model="userEditFormData.admin" :menu-options="getDefaultAdminTopMenus()"></DgaTopMenuForm>
      </div>
    </template>
    <template v-if="isDev">
      <div class="col-span-12 md:col-span-3">
        {{ $t('app.preferences.topMenu.dev') }}
      </div>
      <div class="col-span-12 md:col-span-9">
        <DgaTopMenuForm v-model="userEditFormData.dev" :menu-options="getDefaultDevTopMenus()"></DgaTopMenuForm>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { getDefaultAdminTopMenus, getDefaultDevTopMenus, getDefaultTopMenus } from '~/src/services/form/preference';
import { checkPermissionNeeds } from '~/src/services/validations/permission';

const props = withDefaults(defineProps<{
  modelValue?: UserPreferencesTopMenu,
}>(), {});

const modelValue = computed(() => props.modelValue);

const userEditFormData : Ref<UserPreferencesTopMenu> = ref({
  voter: getDefaultTopMenus(),
  admin: getDefaultAdminTopMenus(),
  dev: getDefaultDevTopMenus(),
});

const emit = defineEmits<{
  (e: "update:modelValue", v: UserPreferencesTopMenu) : void,
}>();

const isAdmin = computed(() => checkPermissionNeeds(useSessionData().value.permissions, "admin-mode"));
const isDev = computed(() => checkPermissionNeeds(useSessionData().value.permissions, "dev-mode"));

watch(modelValue, (value) => {
  if(value) {
    userEditFormData.value = value;
  }
}, { deep: true, immediate: true })

watch(userEditFormData, (value) => {
  emit("update:modelValue", value);
}, { deep: true })

</script>