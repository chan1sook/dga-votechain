import dayjs from "dayjs";
import { getTxCounts } from "../utils";
import BlockchainServerModel from "~~/server/models/blockchain-server"

export default defineEventHandler(async (event) => {
  const [txCounts, blockchainServerDocs] = await Promise.all([
    getTxCounts(),
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
    blocks: txCounts,
  }
})