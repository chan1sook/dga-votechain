<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-4">
      {{  $t("app.login.title") }}
    </h2>
    <DgaButtonGroup larger class="mt-6">
      <form action="/api/login" method="POST" class="w-full">
        <input type="hidden" name="source" value="digitalId" />
        <DgaButton type="submit" class="w-full flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('app.login.loginDigitalId')"
        >
          <FingerprintIcon />
          <span class="truncate">
            {{ $t("app.login.loginDigitalId") }}
          </span>
        </DgaButton>
      </form>
    </DgaButtonGroup>
    <DgaButtonGroup larger class="mt-2">
      <form action="/api/login" method="POST" class="w-full">
        <input type="hidden" name="source" value="thaID" />
        <DgaButton type="submit" class="w-full flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-blue" :title="$t('app.login.loginThaId')"
        >
          <img src="~/assets/images/thaid_logo.jpg" class="w-8" height="24" />
          <span class="truncate">
            {{ $t("app.login.loginThaId") }}
          </span>
        </DgaButton>
      </form>
    </DgaButtonGroup>
    <DgaButtonGroup larger class="mt-2">
      <form action="/api/login" method="POST" class="w-full">
        <input type="hidden" name="source" value="digitalId" />
        <input type="hidden" name="register" value="1" />
        <DgaButton type="submit" theme="hollow" class="w-full flex flex-row gap-x-2 items-center justify-center truncate"
          :title="$t('app.login.registerDigitalId')"
        >
          <AccountPlusOutlineIcon />
          <span class="truncate">
            {{ $t("app.login.registerDigitalId") }}
          </span>
        </DgaButton>
      </form>
    </DgaButtonGroup>
  </div>
</template>

<script setup lang="ts">
import FingerprintIcon from 'vue-material-design-icons/Fingerprint.vue';
import AccountPlusOutlineIcon from 'vue-material-design-icons/AccountPlusOutline.vue';
</script>