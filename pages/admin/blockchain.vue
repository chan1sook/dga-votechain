<template>
  <div v-if="stats">
    <DgaHead>{{ $t('admin.blockchain.title') }}</DgaHead>
    <div class="grid grid-cols-12 py-2 gap-2 mx-auto max-w-6xl">
      <div class="col-span-12 lg:col-span-4 flex flex-col border-2 border-dga-blue rounded-md self-start">
        <h4 class="font-bold text-lg p-2">{{ $t('admin.blockchain.blockInfo.title') }}</h4>
        <div class="grid grid-cols-6 p-2">
          <div class="col-span-4 align-center self-center">
            <div class="text-lg font-bold">
              {{ $t('admin.blockchain.blockInfo.total') }}: <span class="text-3xl">{{ stats.blocks.total }}</span>
            </div>
          </div>
          <div class="col-span-2 self-center flex flex-col gap-1">
            <div>
              {{ $t('admin.blockchain.blockInfo.mined') }}: {{ stats.blocks.mined }}
            </div>
            <div>
              {{ $t('admin.blockchain.blockInfo.pending') }}: {{  stats.blocks.pending }}
            </div>
          </div>
        </div>

        <h4 class="font-bold text-lg border-t-2 border-dga-blue p-2">
          {{ $t('admin.blockchain.serverStatus.title') }}
        </h4>
        <div class="grid grid-cols-6">
          <div class="col-span-4 align-center self-center p-2">
            <div class="text-lg font-bold">
              {{ $t('admin.blockchain.serverStatus.online') }}: <span class="text-green-700 text-3xl">{{ countServerOnlines(stats.servers) }}
            </span>/{{ stats.servers.length }}</div>
          </div>
          <div class="col-span-2 self-center">
            {{ $t('admin.blockchain.serverStatus.offline') }}: {{ stats.servers.length - countServerOnlines(stats.servers)  }}
          </div>
        </div>

        <h4 class="font-bold text-lg border-t-2 border-dga-blue p-2">
          {{ $t('admin.blockchain.searchTx') }}
        </h4>
        <div class="flex flex-row gap-2 items-center p-2">
          <DgaInput v-model="searchKeyword" type="search" class="flex-1" :placeholder="$t('admin.blockchain.txhash')"></DgaInput>
          <DgaButton class="flex-row gap-2 items-center !px-4 !py-1" color="dga-orange" @click="toTxPage(searchKeyword)">
            <MaterialIcon icon="search"></MaterialIcon>
          </DgaButton>
        </div>
      </div>
      <div class="col-span-12 lg:col-span-8 flex flex-col border-2 border-dga-blue rounded-md max-h-[600px]">
        <h4 class="font-bold text-lg p-2">{{ $t('admin.blockchain.liveTxUpdate') }}</h4>
        <div class="flex-1 border-t-2 border-dga-blue p-2 overflow-y-auto">
          <div class="flex flex-col gap-2">
            <DgaTxCard v-for="ele of txData" :status="ele.txStatus" @detail="toTxPage(ele.voteId.toString())">
              <template #voteid>
                {{ $t('admin.blockchain.voteid') }}: #{{ ele.voteId }}</template>
              <template #txid>{{ $t('admin.blockchain.txhash') }}: 
                <span v-if="ele.txhash">#{{ ele.txhash }}</span>
                <span v-else class="italic">N/A</span>
              </template>
              <template #type>{{ $t('admin.blockchain.type.vote') }}</template>
              <span>
                {{ ele.topicId }} : {{ ele.userId }} =>
                <template v-if="ele.choice">{{ ele.choice }}</template> 
                <i v-else>{{ $t('voting.noVote')}}</i>
              </span>
            </DgaTxCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { getComputedServerTime } from '~~/src/utils/datetime';

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-dev"]
})
useHead({
  title: `${i18n.t('appName', 'Dga E-Voting')} - ${i18n.t('admin.blockchain.title')}`
});

const txInfo : Ref<TxInfoResponseData | undefined> = ref(undefined);
const txData : Ref<Array<TxResponseData>> = ref([]);
const searchKeyword = ref("");
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

function countServerOnlines(servers: Array<BlockchainServerDataResponse>) {
  const onlineThershold = useRuntimeConfig().BLOCKCHAIN_SERVERHB_TIME_THERSOLD;
  return servers.reduce((prev, current) => {
    if(current.lastActiveAt) {
      const diff = dayjs(getComputedServerTime()).diff(current.lastActiveAt);
      if(diff <= onlineThershold) {
        return prev + 1;
      }
      return prev;
    }
    return prev;
  }, 0);
}

const socket = useSocketIO();
socket.on("tx", (txArr: Array<TxResponseData>) => {
  for(const tx of txArr) {
    const index = txData.value.findIndex((ele) => ele.voteId === tx.voteId);
    if(index === -1) {
      txData.value.unshift(tx);
      if(txInfo.value) {
        txInfo.value.blocks.total += 1;
      }
    }
  }
});

socket.on("txmined", (tx: TxResponseData) => {
  const index = txData.value.findIndex((ele) => ele.voteId === tx.voteId);
  if(index !== -1) {
    txData.value[index] = tx;
    if(txInfo.value) {
      txInfo.value.blocks.mined += 1;
    }
  }
});

socket.on("blockchain-server-hb", (data: BlockchainServerDataResponse) => {
  // update
  if(txInfo.value) {
    const targetIndex = txInfo.value.servers.findIndex((ele) => ele._id === data._id);
    console.log("blockchain-server-hb", data, targetIndex);
    if(targetIndex !== -1) {
      txInfo.value.servers[targetIndex] = data;
    }
  }
});

</script>