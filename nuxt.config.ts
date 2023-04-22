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
    public: {
      DID_API_URL: isProduction ? process.env.DID_API_URL : process.env.DEV_DID_API_URL,
      SOCKETIO_URL: isProduction ? process.env.SOCKETIO_URL : process.env.DEV_SOCKETIO_URL,
      SYNCTIME_THERSOLD: 60 * 1000,
    },
    PREDEFINED_DEV_USERS: [
      "b41eb19a-d531-4cf2-44c7-08db203dac90",
      "d8f90135-ced7-4e4b-9bcb-08da5eeb01b7",
    ],
  },
  telemetry: false,
  dev: true,
  nitro: {
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
    vueI18n: {
      fallbackLocale: 'th',
      datetimeFormats: {
        th: {
          long: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' },
          short: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
        },
        en: {
          long: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' },
          short: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
        }
      }
    },
    config: {
      fallbackLocale: 'th',
      datetimeFormats: {
        th: {
          long: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' },
          short: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
        },
        en: {
          long: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' },
          short: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
        }
      }
    },
    lazy: true,
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
