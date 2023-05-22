import dayjs from "dayjs";
import { getTxArr } from "../utils";
import BlockchainServerModel from "~~/server/models/blockchain-server"

export default defineEventHandler(async (event) => {
  const [txDocs, blockchainServerDocs] = await Promise.all([
    getTxArr(100000, ""),
    BlockchainServerModel.find(),
  ]);

  return {
    servers: blockchainServerDocs.map((ele) => {
      return {
        _id: `${ele._id}`,
        host: ele.host,
        createdAt: dayjs(ele.createdAt).toString(),
        updatedAt: dayjs(ele.updatedAt).toString(),
        lastActiveAt: ele.lastActiveAt ? dayjs(ele.lastActiveAt).toString() : undefined,
      }
    }),
    blocks: {
      mined: txDocs.filter((ele) => ele.txStatus === "valid").length,
      invalid: txDocs.filter((ele) => ele.txStatus === "invalid").length,
      pending: txDocs.filter((ele) => ele.txStatus === "pending").length,
      total: txDocs.length,
    }
  }
})