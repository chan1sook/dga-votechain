<template>
  <DgaLoginModule :cbtid="cbtid?.toString()"></DgaLoginModule>
</template>

<script setup lang="ts">
const i18n = useI18n();

const { cbtid } = useRoute().query;
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
