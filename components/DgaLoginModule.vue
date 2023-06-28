<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-4">
      {{  $t("login.title") }}
    </h2>
    <DgaButtonGroup larger class="mt-6">
      <form action="/api/login" method="POST" class="w-full">
        <input type="hidden" name="source" value="digitalId" />
        <DgaButton type="submit" class="w-full flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('login.loginDigitalId')"
        >
          <FingerprintIcon />
          <span class="truncate">
            {{ $t("login.loginDigitalId") }}
          </span>
        </DgaButton>
      </form>
    </DgaButtonGroup>
    <DgaButtonGroup larger class="mt-2">
      <NuxtLink :to="registerDigitalIdUrl">
        <DgaButton theme="hollow" class="w-full flex flex-row gap-x-2 items-center justify-center truncate"
          :title="$t('login.registerDigitalId')"
        >
          <AccountPlusOutlineIcon />
          <span class="truncate">
            {{ $t("login.registerDigitalId") }}
          </span>
        </DgaButton>
      </NuxtLink>
    </DgaButtonGroup>
  </div>
</template>

<script setup lang="ts">

import FingerprintIcon from 'vue-material-design-icons/Fingerprint.vue';
import AccountPlusOutlineIcon from 'vue-material-design-icons/AccountPlusOutline.vue';

const { public: { DID_API_URL } } = useRuntimeConfig();
const registerDigitalIdUrl = computed(() => new URL("/Account/Register", DID_API_URL).toString());

</script>