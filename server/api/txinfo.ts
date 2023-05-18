import { getTxArr } from "../utils";

export default defineEventHandler(async (event) => {
  const txDocs = await getTxArr(100000, "");

  return {
    server: {
      online: 3,
      total: 3,
    },
    blocks: {
      mined: txDocs.filter((ele) => ele.mined).length,
      total: txDocs.length,
    }
  }
})