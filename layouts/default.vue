<template>
  <div>
    <DgaContainer>
      <slot></slot>
    </DgaContainer>
    <DgaToastController></DgaToastController>
  </div>
</template>

<script setup lang="ts">
import DgaToastController from '~~/components/DgaToastController.vue';
import { webAppName } from '~~/src/utils/utils';

useSocketIO();
useRefreshNotificationData().value = true;

useHead({
  title: webAppName,
  link: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    }
  ]
});
</script>