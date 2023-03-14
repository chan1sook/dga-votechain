<template>
  <div class="p-4 w-full max-w-3xl mx-auto dga-error-container">
    <div v-if="error" class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ error.statusCode || 500 }}
      </h1>
      <div class="text-2xl my-4 text-center">
        {{ error.message }}
      </div>
      <div class="my-2 text-center">
        <button type="button" class="dga-evote-btn w-full max-w-sm inline-flex gap-2 items-center justify-center" title="Back to Home" @click="handleClearError">
          <MaterialIcon icon="home"/>
          <span class="truncate">Back to Home</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { webAppName } from './src/utils/utils';

useHead({
  title: `${webAppName} - Error`,
  link: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    }
  ]
});

const error = useError();
const handleClearError = () => clearError({ redirect: '/' });
</script>

<style>
.dga-error-container {
  @apply h-screen flex flex-col items-center justify-center
}
.dga-error-container > div {
  @apply w-full py-16
}
</style>