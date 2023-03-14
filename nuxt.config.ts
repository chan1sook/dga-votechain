// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    MONGODB_URI: "mongodb://localhost:27017",
    DB_NAME: "dga_evote_test",
    DID_CLIENT_KEY: "c0a10258-6142-4257-8aea-c374e151bfe5",
    DID_CLIENT_SECRET: "MCqudBiP8EX",
    DID_VERIFY_CODE: "3e2727957a1bd9f47b11ff347fca362b6060941decb4",
    DID_LOGIN_CALLBACK: "https://e-vote.sensesiot.net/api/callback/login",
    public: {
      DID_API_URL: "https://connect.dga.or.th",
    }
  },
  nitro: {
    devStorage: {
      session: {
        driver: "mongodb",
        connectionString: "mongodb://localhost:27017/",
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
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});
