import { getTxListFilter } from "~/src/services/fetch/tx";

export default defineEventHandler(async (event) => {
  const { pagesize, startid } : TxChainQueryParams = getQuery(event);
  
  const txDocs = await getTxListFilter(pagesize || 1000, startid || "");

  return txDocs;
})