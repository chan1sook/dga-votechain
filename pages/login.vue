<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-4">
      Login
    </h2>
    <DgaButtonGroup larger class="mt-6">
      <a href="/api/login">
        <DgaButton class="w-full flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" title="Login with Digital ID"
        >
          <MaterialIcon icon="fingerprint"/>
          <span class="truncate">Login with Digital ID</span>
        </DgaButton>
      </a>
    </DgaButtonGroup>
    <DgaButtonGroup larger class="mt-2">
      <NuxtLink :to="registerUrl">
        <DgaButton theme="hollow" class="w-full flex flex-row gap-x-2 items-center justify-center truncate" title="Register">
          <MaterialIcon icon="how_to_reg"/>
          <span class="truncate">Register</span>
        </DgaButton>
      </NuxtLink>
    </DgaButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-guest"]
})
useHead({
  title: `${webAppName} - Login`
});

const { DID_API_URL } = useRuntimeConfig();
const registerUrl = computed(() => new URL("/Account/Register", DID_API_URL).toString());
</script>