<template>
  <div v-if="langLoaded">
    <DgaContainer>
      <slot></slot>
    </DgaContainer>
    <DgaToastController></DgaToastController>
  </div>
  <DgaLoadingModal :show="!langLoaded"></DgaLoadingModal>
  <DgaCookieConsent v-show="langLoaded && cookieConsentShow"
    @accept-all="acceptAllCookies"
    @accept-required="acceptRequiredOnly"
  ></DgaCookieConsent>
</template>

<script setup lang="ts">
import DgaToastController from '~~/components/DgaToastController.vue';
const i18n = useI18n();
const langLoaded = ref(false);
const cookieConsentShow = ref(false);
useSocketIO();

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')}`,
  meta: [
    {name: "msapplication-TileColor", content: "#da532c"},
    {name: "theme-color", content: "#ffffff"}
  ],
  link: [
    { rel: "apple-touch-icon", sizes:"180x180", href:"/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", sizes:"32x32", href:"/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes:"16x16", href:"/favicon-16x16.png" },
    { rel: "manifest", href: "/site.webmanifest" },
    { rel: "mask-icon", href: "/safari-pinned-tab.svg", color:"#5bbad5" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    // { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Mitr:wght@400&display=swap"
    },
  ],
});

const cookieName = "cc"
onMounted(async () => {
  document.body.addEventListener("click", () => {
    useVisibleMenuGroup().value = undefined;
  })

  await i18n.waitForPendingLocaleChange();
  console.log("Langauge Loaded");
  langLoaded.value = true;
  
  const cc = useCookie(cookieName, { secure: true, sameSite: "lax"});
  cookieConsentShow.value = !Boolean(cc.value);
  enforceCookie(cc.value);
})

function enforceCookie(value: string | null) {
  if(value === "all") {
    // all
  } else {
    /// required only
  }
}

function acceptAllCookies() {
  const cc = useCookie(cookieName, { secure: true, sameSite: "lax"});
  cc.value = "all";
  cookieConsentShow.value = false;
  enforceCookie(cc.value);
}

function acceptRequiredOnly() {
  const cc = useCookie(cookieName, { secure: true, sameSite: "lax"});
  cc.value = "required";
  cookieConsentShow.value = false;
  enforceCookie(cc.value);
}

</script>