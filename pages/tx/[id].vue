<template>
  <div v-if="txData">
    <DgaHead>{{ $t('admin.blockchain.txInfo')}}</DgaHead>
    <div class="grid-2-list my-2 mx-auto max-w-4xl">
      <h3 class="font-bold">{{ $t('admin.blockchain.voteid') }}</h3>
      <span>{{ voteid }}</span>
      <h3 class="font-bold">{{ $t('admin.blockchain.txhash') }}</h3>
      <span v-if="txData && txData.txhash">{{ txData.txhash }}</span>
      <span v-else class="italic">N/A</span>
      <h3 class="font-bold">{{ $t('admin.blockchain.type.title') }}</h3>
      <span>{{ $t('admin.blockchain.type.vote')}}</span>
      <h3 class="font-bold">{{ $t('admin.blockchain.status') }}</h3>
      <span>
        <template v-if="txData.txStatus === 'valid'">
          {{ $t('admin.blockchain.blockInfo.mined') }}
        </template>
        <template v-else-if="txData.txStatus === 'invalid'">
          {{ $t('admin.blockchain.blockInfo.invalid') }}
        </template>
        <template v-else>
          {{ $t('admin.blockchain.blockInfo.pending') }}
        </template>
      </span>
      <h3 class="font-bold">{{ $t('admin.blockchain.createdAt')}}</h3>
      <span>
        {{ $d(dayjs(txData.createdAt).toDate(), "long") }}
      </span>
      <h3 class="font-bold">{{ $t('admin.blockchain.transactionData')}}</h3>
      <div class="overflow-x-auto">
        <div v-for="(val, key) of filterTxData(txData)" class="inline flex-row gap-2 items-start">
          <div class="font-bold whitespace-nowrap">{{ key }} :</div>
          <div v-if="key === 'choice'" class="flex-1">
            <template v-if="val">{{ val }}</template> 
            <i v-else-if="txData.txhash">{{ $t('app.voting.noVote')}}</i>
          </div>
          <div v-else class="flex-1">{{ val }}</div>
        </div>
      </div>
      <h3 class="font-bold">{{ $t('admin.blockchain.transactionRawData')}}</h3>
      <div class="overflow-x-auto">
        <div v-if="txData.txData" v-for="(val, key) of txData.txData" class="flex flex-row gap-2 items-start">
          <div class="font-bold whitespace-nowrap">{{ key }} :</div>
          <div class="flex-1 break-all">{{ val }}</div>
        </div>
        <div v-else class="flex flex-row gap-2 items-start italic">
          N/A
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
let voteid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('admin.blockchain.txInfo')} ${voteid}`
});

const txData: Ref<TxResponseDataWithRaw | undefined> = ref(undefined);
const { data } = await useFetch(`/api/tx/${voteid}`);
if(!data.value) {
  showError("VoteID not found")
} else {
  txData.value = data.value;
}

function filterTxData(tx: TxResponseDataWithRaw) {
  const result: Partial<TxResponseDataWithRaw> = {
    ...tx,
  }
  delete result.txStatus;
  delete result.createdAt;
  delete result.txhash;
  delete result.txData;
  return result;
}


</script>

<style scoped>
.grid-2-list {
  @apply grid gap-2;
  grid-template-columns: max-content auto;
}
</style>