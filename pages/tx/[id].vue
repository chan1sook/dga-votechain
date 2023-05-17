<template>
  <div v-if="txData">
    <DgaHead>{{ $t('blockchain.txInfo')}}</DgaHead>
    <div class="grid-2-list my-2 mx-auto max-w-4xl">
      <h3 class="font-bold">{{ $t('blockchain.txid')}}</h3>
      <span>{{txid}}</span>
      <h3 class="font-bold">{{ $t('blockchain.type.title')}}</h3>
      <span>{{ $t('blockchain.type.vote')}}</span>
      <h3 class="font-bold">{{ $t('blockchain.status')}}</h3>
      <span>
        <template v-if="txData.Mined">
          {{ $t('blockchain.blockInfo.mined') }}
        </template>
        <template v-else>
          {{ $t('blockchain.blockInfo.pending') }}
        </template>
      </span>
      <h3 class="font-bold">{{ $t('blockchain.createdAt')}}</h3>
      <span>
        {{ $d(dayjs(txData.CreatedAt).toDate(), "long") }}
      </span>
      <h3 class="font-bold">{{ $t('blockchain.blockdata')}}</h3>
      <div class="overflow-x-auto">
        <div v-for="(val, key) of filtertxData(txData)" class="flex flex-row gap-2 items-start">
          <div class="font-bold whitespace-nowrap">{{ key }} :</div>
          <div v-if="key === 'Choice'" class="flex-1">
            <template v-if="val">{{ val }}</template> 
            <i v-else>{{ $t('voting.noVote')}}</i>
          </div>
          <div v-else class="flex-1">{{ val }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';

const i18n = useI18n();

definePageMeta({
  middleware: ["auth-dev"]
})
const { id } = useRoute().params;
let txid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${i18n.t('appName', 'Dga E-Voting')} - ${i18n.t('blockchain.txInfo')} ${txid}`
});

const txData: Ref<TxResponseData | undefined> = ref(undefined);
const { data } = await useFetch(`/api/tx/${txid}`);
if(!data.value) {
  showError("Tx not found")
} else {
  txData.value = data.value;
}

function filtertxData(tx: TxResponseData) {
  const result: Partial<TxResponseData> = {
    ...tx,
  }
  delete result.Mined;
  delete result.CreatedAt;
  return result;
}


</script>

<style scoped>
.grid-2-list {
  @apply grid gap-2;
  grid-template-columns: max-content auto;
}
</style>