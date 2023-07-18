<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 flex flex-row items-center gap-1 md:col-span-3">
      <span>{{ $t("app.firstName") }}</span>
    </div>
    <div class="col-span-12 md:col-span-9">
      <DgaInput
        :value="userEditFormData.firstName"
        class="w-full"
        :placeholder="$t('app.firstName')"
        disabled
      ></DgaInput>
    </div>
    <div class="col-span-12 flex flex-row items-center gap-1 md:col-span-3">
      <span>{{ $t("app.lastName") }}</span>
    </div>
    <div class="col-span-12 md:col-span-9">
      <DgaInput
        v-model="userEditFormData.lastName"
        class="w-full"
        :placeholder="$t('app.lastName')"
        disabled
      ></DgaInput>
    </div>
    <div class="col-span-12 flex flex-row items-center gap-1 md:col-span-3">
      <span>{{ $t("app.email") }}</span>
    </div>
    <div class="col-span-12 md:col-span-9">
      <DgaInput
        v-model="userEditFormData.email"
        class="w-full"
        :placeholder="$t('app.email')"
      ></DgaInput>
    </div>
    <div class="col-span-12">
      <DgaCheckbox v-model="userEditFormData.isGovOfficer" />
      {{ $t("app.preferences.isGovOfficer") }}
    </div>
    <div class="col-span-12 flex flex-row items-center gap-1 md:col-span-3">
      <span>{{ $t("app.ministry") }}</span>
      <AsteriskIcon
        v-if="userEditFormData.isGovOfficer"
        :title="$t('app.required')"
        class="text-red-500"
        :size="8"
      />
    </div>
    <div class="col-span-12 md:col-span-9">
      <DgaMinistryVueSelect
        v-model="userEditFormData.ministry"
        :disabled="!userEditFormData.isGovOfficer"
      >
      </DgaMinistryVueSelect>
    </div>
    <div class="col-span-12 flex flex-row items-center gap-1 md:col-span-3">
      <span>{{ $t("app.department") }}</span>
      <AsteriskIcon
        v-if="userEditFormData.isGovOfficer"
        :title="$t('app.required')"
        class="text-red-500"
        :size="8"
      />
    </div>
    <div class="col-span-12 md:col-span-9">
      <DgaInput
        v-model="userEditFormData.department"
        :disabled="!userEditFormData.isGovOfficer"
        class="w-full"
        :placeholder="$t('app.department')"
      ></DgaInput>
    </div>
    <div class="col-span-12 flex flex-row items-center gap-1 md:col-span-3">
      <span>{{ $t("app.division") }} </span>
    </div>
    <div class="col-span-12 flex flex-col gap-y-1 md:col-span-9">
      <DgaInput
        v-model="userEditFormData.division"
        :disabled="!userEditFormData.isGovOfficer"
        class="w-full"
        :placeholder="$t('app.division')"
      ></DgaInput>
    </div>
  </div>
</template>
<script setup lang="ts">
import AsteriskIcon from "vue-material-design-icons/Asterisk.vue";

const props = withDefaults(
  defineProps<{
    modelValue?: UserEditFormData;
  }>(),
  {}
);

const emit = defineEmits<{
  (e: "update:modelValue", v: UserEditFormData): void;
}>();

const userEditFormData: Ref<UserEditFormData> = ref({
  firstName: "",
  lastName: "",
  email: "",
  isGovOfficer: false,
  ministry: "",
  department: "",
  division: "",
});

const modelValue = computed(() => props.modelValue);

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
