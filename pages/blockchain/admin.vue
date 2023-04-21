<template>
  <div v-if="stats">
    <DgaHead>{{ $t('blockchain.title') }}</DgaHead>
    <div class="grid grid-cols-12 py-2 gap-2 mx-auto max-w-6xl">
      <div class="col-span-12 lg:col-span-4 flex flex-col border-2 border-dga-blue rounded-md self-start">
        <h4 class="font-bold text-lg p-2">{{ $t('blockchain.blockInfo.title') }}</h4>
        <div class="grid grid-cols-6 p-2">
          <div class="col-span-4 align-center self-center">
            <div class="text-lg font-bold">
              {{ $t('blockchain.blockInfo.title') }}: <span class="text-3xl">{{ stats.blocks.total }}</span>
            </div>
          </div>
          <div class="col-span-2 self-center flex flex-col gap-1">
            <div>
              {{ $t('blockchain.blockInfo.mined') }}: {{ stats.blocks.mined }}
            </div>
            <div>
              {{ $t('blockchain.blockInfo.pending') }}: {{  stats.blocks.total - stats.blocks.mined }}
            </div>
          </div>
        </div>

        <h4 class="font-bold text-lg border-t-2 border-dga-blue p-2">
          {{ $t('blockchain.serverStatus.title') }}
        </h4>
        <div class="grid grid-cols-6">
          <div class="col-span-4 align-center self-center p-2">
            <div class="text-lg font-bold">
              {{ $t('blockchain.serverStatus.online') }}: <span class="text-green-700 text-3xl">{{ stats.server.online }}
            </span>/{{ stats.server.total }}</div>
          </div>
          <div class="col-span-2 self-center">
            {{ $t('blockchain.serverStatus.offline') }}: {{ stats.server.total - stats.server.online }}
          </div>
        </div>

        <h4 class="font-bold text-lg border-t-2 border-dga-blue p-2">
          {{ $t('blockchain.searchTx') }}
        </h4>
        <div class="flex flex-row gap-2 items-center p-2">
          <DgaInput type="search" class="flex-1" :placeholder="$t('blockchain.txId')"></DgaInput>
          <DgaButton class="flex-row gap-2 items-center !px-4 !py-1" color="dga-orange" @click="toTxPage">
            <MaterialIcon icon="search"></MaterialIcon>
          </DgaButton>
        </div>
      </div>
      <div class="col-span-12 lg:col-span-8 flex flex-col border-2 border-dga-blue rounded-md max-h-[600px]">
        <h4 class="font-bold text-lg p-2">{{ $t('blockchain.liveTxUpdate') }}</h4>
        <div class="flex-1 overflow-auto border-t-2 border-dga-blue p-2 flex flex-col gap-2">
          <DgaTxDemoCard v-for="ele of txData" :mined="true" @detail="toTxPage(ele._id.toString())">
            <template #txid>TX: #{{ ele._id }}</template>
            <template #type>Vote</template>
            {{ ele.topicid }} : {{ ele.userid }} => {{ ele.choice }} 
          </DgaTxDemoCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth"]
})
useHead({
  title: `${i18n.t('appName')} - ${i18n.t('blockchain.title')}`
});

const txInfo : Ref<TxInfoResponseData | undefined> = ref(undefined);
const txData : Ref<Array<TxResponseData>> = ref([]);
const { data: stats } = await useFetch("/api/txinfo");
const { data: tx } = await useFetch("/api/txchain");

if(stats.value && tx.value) {
  txInfo.value = stats.value;
  txData.value = tx.value;
} else {
  showError("Can't get tx data")
}

function toTxPage(id : string) {
  navigateTo(localePathOf(`/tx/${id}`));
}

const socket = useSocketIO();
socket.on("tx", (txArr: Array<TxResponseData>) => {
  for(const tx of txArr) {
    txData.value.unshift(tx);
  }
});

</script>