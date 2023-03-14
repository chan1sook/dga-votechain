<template>
  <div class="p-4 w-full mx-auto">
    <div class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-4">
        Developer
      </h2>
      <div class="grid grid-cols-1 gap-4 max-w-7xl mx-auto my-4">
        <BasicCard>
          <template #header>Monitor Chain</template>
          <div class="p-2 pb-0 flex flex-row items-center gap-2">
            <label class="flex-none">Search</label>
            <div class="flex-1 inline-flex flex-row">
              <input v-model="searchKeyword" type="search" class="dga-evote-input rounded-r-none w-0 flex-1" placeholder="TX/ID Search"/>
              <button type="button" class="dga-evote-btn px-2 py-1 rounded-l-none rounded-r-md inline-flex flex-row items-center" title="Search">
                <MaterialIcon icon="search" />
              </button>
            </div>
          </div>
          <div v-if="searching" class="p-2 text-center">Searching</div>
          <div v-else-if="txArr.length === 0" class="p-2 text-center italic">Not found [{{ actualSearchKeyword }}]</div>
          <div v-else class="p-2 overflow-auto max-h-60">
            <NuxtLink v-for="tx of txArr" :to="`/tx/${tx._id}`">
              <BasicListItem header-class="w-64">
                <template #header>#{{ tx._id }}</template>
                <div class="flex flex-col">
                  <div class="truncate">User #{{ tx.userid }}</div>
                  <div class="truncate">=&gt; Topic #{{ tx.topicid  }}</div>
                  <div class="truncate">=&gt; Choose [{{ tx.choice  }}]</div>
                </div>
              </BasicListItem>
            </NuxtLink>
            <template v-if="!searching && hasMoreTx">
              <div v-if="!isLoadMoreTx" class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
                <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="Load More TX" @click="loadMoreTx">
                  <MaterialIcon icon="autorenew" />
                  <span class="truncate">Load More TX</span>
                </button>
              </div>
              <div v-else class="p-2 text-center italic">Loading...</div>
            </template>
          </div>
        </BasicCard>
      </div>
      <div class="my-2 flex flex-col sm:flex-row sm:justify-center flex-wrap gap-2">
        <NuxtLink to="/permissions/approve" class="w-full sm:w-72 block">
          <button type="button" class="dga-evote-btn w-full inline-flex gap-2 items-center justify-center" title="ตั้งโหวต">
            <MaterialIcon icon="how_to_reg" />
            <span class="truncate">Approve Permissions</span>
          </button>
        </NuxtLink>
        <button type="button" class="dga-evote-btn w-full sm:w-48 inline-flex gap-2 items-center justify-center" title="สลับโหมด" @click="swapNextMode">
          <MaterialIcon icon="autorenew" />
          <span class="truncate">สลับโหมด</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from "debounce";
import { webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-dev"]
});

useHead({
  title: `${webAppName} - Developer Page`
});

const txArr : Ref<Array<TxResponseData>> = ref([]);
const pagesize = ref(50);
const startid = computed(() => txArr.value.length > 0 ? txArr.value[txArr.value.length - 1]._id : undefined);
const hasMoreTx = ref(false);
const isLoadMoreTx = ref(false);

// todo filter
const searchKeyword = ref("");
const actualSearchKeyword = ref("");
const searching = ref(false);

const searchFunction = debounce<(keyword: string) => void>(async (keyword) => {
  searching.value = true;
  actualSearchKeyword.value = keyword;

  txArr.value = [];
  hasMoreTx.value = false;
  await loadMoreTx();

  searching.value = false;
}, 500);

watch(searchKeyword, searchFunction);

function swapNextMode(event: MouseEvent) {
  navigateTo("/")
}

async function fetchTxFiltered(keyword?: string, pagesize?: number, startid?: string) {
  const fetchResult = await Promise.all([
    useFetch("/api/txchain", {
      query: {keyword, pagesize, startid }
    })
  ])
  const [ txDocs ] = fetchResult.map((ele) => ele.data.value );
  return txDocs;
}

async function loadMoreTx() {
  isLoadMoreTx.value = true;
  const txChain = await fetchTxFiltered(actualSearchKeyword.value, pagesize.value, startid.value);
  if(txChain) {
    txArr.value.push(...txChain.txChain);
    hasMoreTx.value = txChain.txChain.length === pagesize.value;
  }
  isLoadMoreTx.value = false;
}

await loadMoreTx();

</script>