<template>
  <div v-if="txData">
    <DgaHead>{{ $t('blockchain.txInfo')}}</DgaHead>
    <div class="grid-2-list my-2 mx-auto max-w-4xl">
      <h3 class="font-bold">{{ $t('blockchain.txid')}}</h3>
      <span>{{txid}}</span>
      <h3 class="font-bold">{{ $t('blockchain.type')}}</h3>
      <span>Voter</span>
      <h3 class="font-bold">{{ $t('blockchain.status')}}</h3>
      <span>
        {{ $t('blockchain.blockInfo.mined')}}
      </span>
      <h3 class="font-bold">{{ $t('blockchain.blockdata')}}</h3>
      <div>{{ txData }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">

const i18n = useI18n();

definePageMeta({
  middleware: ["auth"]
})
const { id } = useRoute().params;
let txid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${i18n.t('appName')} - ${i18n.t('blockchain.txInfo')} ${txid}`
});

const txData: Ref<TxResponseDataWithPopulated| undefined> = ref(undefined);
const { data } = await useFetch(`/api/tx/${txid}`);
if(!data.value) {
  showError("Tx not found")
} else {
  txData.value = data.value;
}


</script>

<style scoped>
.grid-2-list {
  @apply grid gap-2;
  grid-template-columns: max-content auto;
}
</style>