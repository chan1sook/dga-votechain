<template>
  <div class="p-4 w-full max-w-3xl mx-auto">
    <div class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-4">
        Login
      </h2>
      <div class="my-2 text-center">
        <a href="/api/login">
          <button type="button" class="dga-evote-btn w-full max-w-sm inline-flex gap-2 items-center justify-center" title="Login with Digital ID">
            <MaterialIcon icon="fingerprint"/>
            <span class="truncate">Login with Digital ID</span>
          </button>
        </a>
      </div>
      <div class="my-2 text-center">
        <NuxtLink :to="registerUrl">
          <button type="button" class="dga-evote-btn w-full max-w-sm inline-flex gap-2 items-center justify-center" title="Register">
            <MaterialIcon icon="how_to_reg"/>
            <span class="truncate">Register</span>
          </button>
        </NuxtLink>
      </div>
    </div>
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