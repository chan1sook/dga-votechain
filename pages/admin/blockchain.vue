<template>
  <div v-if="stats">
    <DgaHead>{{ $t("app.admin.blockchain.title") }}</DgaHead>
    <div class="mx-auto grid max-w-6xl grid-cols-12 gap-2 py-2">
      <div
        class="col-span-12 flex flex-col self-start rounded-md border-2 border-dga-blue lg:col-span-4"
      >
        <h4 class="p-2 text-lg font-bold">
          {{ $t("app.admin.blockchain.blockInfo.title") }}
        </h4>
        <div class="grid grid-cols-6 p-2">
          <div class="align-center col-span-4 self-center">
            <div class="text-lg font-bold">
              {{ $t("app.admin.blockchain.blockInfo.total") }}:
              <span class="text-3xl">{{ stats.blocks.total }}</span>
            </div>
          </div>
          <div class="col-span-2 flex flex-col gap-1 self-center">
            <div>
              {{ $t("app.admin.blockchain.blockInfo.mined") }}:
              {{ stats.blocks.mined }}
            </div>
            <div>
              {{ $t("app.admin.blockchain.blockInfo.pending") }}:
              {{ stats.blocks.pending }}
            </div>
          </div>
        </div>

        <h4 class="border-t-2 border-dga-blue p-2 text-lg font-bold">
          {{ $t("app.admin.blockchain.serverStatus.title") }}
        </h4>
        <div class="grid grid-cols-6">
          <div class="align-center col-span-4 self-center p-2">
            <div class="text-lg font-bold">
              {{ $t("app.admin.blockchain.serverStatus.online") }}:
              <span class="text-3xl text-green-700"
                >{{ countServerOnlines(stats.servers) }} </span
              >/{{ stats.servers.length }}
            </div>
          </div>
          <div class="col-span-2 self-center">
            {{ $t("app.admin.blockchain.serverStatus.offline") }}:
            {{ stats.servers.length - countServerOnlines(stats.servers) }}
          </div>
        </div>

        <h4 class="border-t-2 border-dga-blue p-2 text-lg font-bold">
          {{ $t("app.admin.blockchain.searchTx") }}
        </h4>
        <div class="flex flex-row items-center gap-2 p-2">
          <DgaInput
            v-model="searchKeyword"
            type="search"
            class="flex-1"
            :placeholder="$t('app.admin.blockchain.txhash')"
          ></DgaInput>
          <DgaButton
            class="flex-row items-center gap-2 !px-4 !py-1"
            color="dga-orange"
            @click="toTxPage(searchKeyword)"
          >
            <MagnifyIcon />
          </DgaButton>
        </div>
      </div>
      <div
        class="col-span-12 flex max-h-[600px] flex-col rounded-md border-2 border-dga-blue lg:col-span-8"
      >
        <h4 class="p-2 text-lg font-bold">
          {{ $t("app.admin.blockchain.liveTxUpdate") }}
        </h4>
        <div class="flex-1 overflow-y-auto border-t-2 border-dga-blue p-2">
          <div class="flex flex-col gap-2">
            <DgaTxCard
              v-for="ele of txData"
              :status="ele.txStatus"
              @detail="toTxPage(ele.voteId.toString())"
            >
              <template #voteid>
                {{ $t("app.admin.blockchain.voteid") }}: #{{
                  ele.voteId
                }}</template
              >
              <template #txid
                >{{ $t("app.admin.blockchain.txhash") }}:
                <span v-if="ele.txhash">#{{ ele.txhash }}</span>
                <span v-else class="italic">N/A</span>
              </template>
              <template #type>{{
                $t("app.admin.blockchain.type.vote")
              }}</template>
              <span>
                {{ ele.topicId }} : {{ ele.userId }} =>
                <template v-if="ele.choice">{{ ele.choice }}</template>
                <i v-else>{{ $t("app.voting.noVote") }}</i>
              </span>
            </DgaTxCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";

import dayjs from "dayjs";

const i18n = useI18n();
const localePathOf = useLocalePath();

definePageMeta({
  middleware: ["auth-dev"],
});
useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.admin.blockchain.title"
  )}`,
});

const blockchainStats: Ref<BlockchainStatsResponseData | undefined> =
  ref(undefined);
const txData: Ref<TxResponseData[]> = ref([]);
const searchKeyword = ref("");
const { data: stats } = await useFetch("/api/txinfo");
const { data: tx } = await useFetch("/api/txchain");

if (stats.value && tx.value) {
  blockchainStats.value = stats.value;
  txData.value = tx.value;
} else {
  showError("Can't get tx data");
}

function toTxPage(id: string) {
  navigateTo(localePathOf(`/tx/${id}`));
}

function countServerOnlines(servers: BlockchainServerDataResponse[]) {
  const onlineThershold =
    useRuntimeConfig().public.BLOCKCHAIN_SERVERHB_TIME_THERSOLD;
  return servers.reduce((prev, current) => {
    if (current.lastActiveAt) {
      const diff = dayjs(useComputedServerTime()).diff(current.lastActiveAt);
      if (diff <= onlineThershold) {
        return prev + 1;
      }
      return prev;
    }
    return prev;
  }, 0);
}

const socket = useSocketIO();
socket.on("tx", (txArr: TxResponseData[]) => {
  for (const tx of txArr) {
    const index = txData.value.findIndex((ele) => ele.voteId === tx.voteId);
    if (index === -1) {
      txData.value.unshift(tx);
      if (blockchainStats.value) {
        blockchainStats.value.blocks.total += 1;
      }
    }
  }
});

socket.on("blockchainHb", (data: BlockchainServerDataResponse) => {
  // update
  if (blockchainStats.value) {
    const targetIndex = blockchainStats.value.servers.findIndex(
      (ele) => ele._id === data._id
    );
    if (targetIndex !== -1) {
      blockchainStats.value.servers[targetIndex] = data;
    }
  }
});
</script>
