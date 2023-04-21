<template>
  <DgaContainer>
    <div v-if="error">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ statusCode }}
      </h1>
      <div class="text-2xl my-4 text-center">
        {{ message }}
      </div>
      <div class="my-2 text-center">
        <DgaButton class="inline-flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('error.backToHome')" @click="handleClearError"
        >
          <MaterialIcon icon="home"/>
          <span class="truncate">
            {{  $t('error.backToHome') }}
          </span>
        </DgaButton>
      </div>
    </div>
  </DgaContainer>
</template>

<script setup lang="ts">
const i18n = useI18n()

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('error.title')}`,
  link: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    }
  ]
});

const error = useError();
const statusCode = computed(() => error.value && !(error.value instanceof Error) ? error.value.statusCode : 500)
const message = computed(() => {
  if(error.value) {
    if(!(error.value instanceof Error)) {
      return error.value.statusMessage || error.value.message;
    } else {
      return error.value.message;
    }
  }
  return "Unknown Error"
})

const handleClearError = () => clearError({ redirect: '/' });
</script>