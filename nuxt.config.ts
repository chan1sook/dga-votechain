// https://nuxt.com/docs/api/configuration/nuxt-config
const isProduction = !process.env.IS_DEV && process.env.NODE_ENV === "production";
console.log("isProduction:", isProduction);

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
  ],
  runtimeConfig: {
    MONGODB_URI: isProduction ? process.env.MONGODB_URI : process.env.DEV_MONGODB_URI,
    DB_NAME: isProduction ? process.env.DB_NAME : process.env.DEV_DB_NAME,
    DID_CLIENT_KEY: isProduction ? process.env.DID_CLIENT_KEY : process.env.DEV_DID_CLIENT_KEY,
    DID_CLIENT_SECRET: isProduction ? process.env.DID_CLIENT_SECRET : process.env.DEV_DID_CLIENT_SECRET,
    DID_VERIFY_CODE: isProduction ? process.env.DID_VERIFY_CODE : process.env.DEV_DID_VERIFY_CODE,
    DID_LOGIN_CALLBACK: isProduction ? process.env.DID_LOGIN_CALLBACK : process.env.DEV_DID_LOGIN_CALLBACK,
    DID_LOGOUT_CALLBACK: isProduction ? process.env.DID_LOGOUT_CALLBACK : process.env.DEV_DID_LOGOUT_CALLBACK,
    SOCKETIO_ORIGIN_URL: isProduction ? process.env.SOCKETIO_ORIGIN_URL : process.env.DEV_SOCKETIO_ORIGIN_URL,
    REDIS_URI: isProduction ? process.env.REDIS_URI : process.env.DEV_REDIS_URI,
    BLOCKCHAIN_PRIVATE_KEY: process.env.BLOCKCHAIN_PRIVATE_KEY,
    BCRYPT_SALT_ROUND: 12,
    public: {
      DID_API_URL: isProduction ? process.env.DID_API_URL : process.env.DEV_DID_API_URL,
      SOCKETIO_URL: isProduction ? process.env.SOCKETIO_URL : process.env.DEV_SOCKETIO_URL,
      SYNCTIME_THERSOLD: 60 * 1000,
      BLOCKCHAIN_SERVERHB_TIME_THERSOLD: 5 * 60 * 1000,
      FB_API_KEY: process.env.FB_API_KEY,
      FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN,
      FB_PROJECT_ID: process.env.FB_PROJECT_ID,
      FB_DATABASE_URL: process.env.FB_DATABASE_URL,
      FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET,
      FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID,
      FB_APP_ID: process.env.FB_APP_ID,
      FB_MEASUREMENT_ID: process.env.FB_MEASUREMENT_ID,
    },
    PREDEFINED_DEV_USERS: [
      "b41eb19a-d531-4cf2-44c7-08db203dac90",
      "d8f90135-ced7-4e4b-9bcb-08da5eeb01b7",
    ],
  },
  telemetry: false,
  dev: true,
  nitro: {
    compressPublicAssets: true,
    storage: {
      session: {
        driver: "redis",
        url: isProduction ? process.env.REDIS_URI : process.env.DEV_REDIS_URI,
      },
      notify: {
        base: "notify",
        driver: "redis",
        url: isProduction ? process.env.REDIS_URI : process.env.DEV_REDIS_URI,
      }
    }
  },
  css: ['~~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  i18n: {
    config: './i18n.config.ts',
    detectBrowserLanguage: {
      useCookie: true,
      alwaysRedirect: true
    },
    lazy: false,
    langDir: 'lang',
    defaultLocale: 'th',
    locales: [
      {
        code: 'en',
        name: "English",
        file: 'en-US.js'
      },
      {
        code: 'th',
        name: "ภาษาไทย",
        file: 'th-TH.js'
      }
    ],
  }
});
