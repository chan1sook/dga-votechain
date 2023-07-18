<template>
  <DgaLoginModule></DgaLoginModule>
</template>

<script setup lang="ts">
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-guest"],
});

useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.login.title",
    "Login"
  )}`,
});
</script>
