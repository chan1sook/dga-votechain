import { initializeApp } from 'firebase/app'
import { getAuth } from "firebase/auth"

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.FB_API_KEY,
    authDomain: config.FB_AUTH_DOMAIN,
    projectId: config.FB_PROJECT_ID,
    databaseURL: config.FB_DATABASE_URL,
    storageBucket: config.FB_STORAGE_BUCKET,
    messagingSenderId: config.FB_MESSAGING_SENDER_ID,
    appId: config.FB_APP_ID,
    measurementId: config.FB_MEASUREMENT_ID
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  nuxtApp.vueApp.provide('auth', auth);
  nuxtApp.provide('auth', auth);
})