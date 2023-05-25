<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-4">
      {{  $t("login.title") }}
    </h2>
    <DgaButtonGroup larger class="mt-6">
      <a href="/api/login?source=digitalId">
        <DgaButton class="w-full flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('login.loginDigitalId')"
        >
          <FingerprintIcon />
          <span class="truncate">
            {{ $t("login.loginDigitalId") }}
          </span>
        </DgaButton>
      </a>
    </DgaButtonGroup>
    <DgaButtonGroup larger class="mt-2">
      <div>
        <DgaButton class="w-full flex flex-row gap-x-2 items-center justify-center truncate"
          :title="$t('login.loginWithGoogle')" @click="loginWithGoogle"
        >
          <FingerprintIcon />
          <span class="truncate">
            {{ $t("login.loginWithGoogle") }}
          </span>
        </DgaButton>
      </div>
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

import { GoogleAuthProvider, useDeviceLanguage, signInWithPopup } from 'firebase/auth'

const i18n = useI18n();

definePageMeta({
  middleware: ["auth-guest"]
})
useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('login.title', "Login")}`
});

const { public: { DID_API_URL } } = useRuntimeConfig();
const registerDigitalIdUrl = computed(() => new URL("/Account/Register", DID_API_URL).toString());
const nuxtApp = useNuxtApp()

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  useDeviceLanguage(nuxtApp.$auth);
  const user = await signInWithPopup(nuxtApp.$auth, provider);
  if (user) {
    const token = await user.user.getIdToken();
    location.href = `/api/login?source=firebase&token=${token}`
  }
}
</script>