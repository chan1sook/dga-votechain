// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    MONGODB_URI: "mongodb://127.0.0.1:27017",
    DB_NAME: "dga_evote_test",
    DID_CLIENT_KEY: "c0a10258-6142-4257-8aea-c374e151bfe5",
    DID_CLIENT_SECRET: "MCqudBiP8EX",
    DID_VERIFY_CODE: "3e2727957a1bd9f47b11ff347fca362b6060941decb4",
    DID_LOGIN_CALLBACK: "https://e-vote.sensesiot.net/api/callback/login",
    public: {
      DID_API_URL: "https://connect.dga.or.th",
      SOCKETIO_URL: "https://e-vote.sensesiot.net:3059",
      SYNCTIME_THERSOLD: 60 * 1000,
    },
    SOCKETIO_ORIGIN_URL: "https://e-vote.sensesiot.net",
    PREDEFINED_DEV_USERS: [
      "b41eb19a-d531-4cf2-44c7-08db203dac90",
      "d8f90135-ced7-4e4b-9bcb-08da5eeb01b7",
    ],
  },
  nitro: {
    devStorage: {
      session: {
        driver: "mongodb",
        connectionString: "mongodb://127.0.0.1:27017/",
        databaseName: "dga_evote_test",
        collectionName: "_session",
      }
    },
    storage: {
      session: {
        driver: "redis",
        url: "redis://localhost:6379/",
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
});
