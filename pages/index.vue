<template>
  <div class="flex flex-col lg:flex-row px-16 py-0 lg:py-12 gap-x-8 gap-y-4">
    <p class="pt-4 text-3xl lg:text-4xl font-bold !leading-loose whitespace-nowrap">
      บริการ E-VOTING <br>
      base on BLOCKCHAIN
    </p>
    <div class="overflow-hidden flex-1">
      <img class="mx-auto max-w-none w-[400px]" src="~/assets/images/blockchain.png" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth"]
})

useHead({
  title: `${webAppName} - หน้าแรก`
});
</script>