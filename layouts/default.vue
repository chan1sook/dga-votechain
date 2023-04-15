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
const i18n = useI18n();

useSocketIO();

useHead({
  title: `${i18n.t('appName')}`,
  meta: [
    {name: "msapplication-TileColor", content: "#da532c"},
    {name: "theme-color", content: "#ffffff"}
  ],
  link: [
    { rel: "apple-touch-icon", size:"180x180", href:"/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", size:"32x32", href:"/favicon-32x32.png" },
    { rel: "icon", type: "image/png", size:"16x16", href:"/favicon-16x16.png" },
    { rel: "manifest", href: "/site.webmanifest" },
    { rel: "mask-icon", href: "/safari-pinned-tab.svg", color:"#5bbad5" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    },
  ],
});

onMounted(() => {
  document.body.addEventListener("click", () => {
    useVisibleMenuGroup().value = undefined;
  })
})
</script>