import dayjs from "dayjs";
import { getTxStats } from "~/src/services/fetch/tx";
import BlockchainServerModel from "~/src/models/blockchain-server";

export default defineEventHandler(async (event) => {
  const [txStats, blockchainServerDocs] = await Promise.all([
    getTxStats(),
    BlockchainServerModel.find(),
  ]);

  return {
    servers: blockchainServerDocs.map((ele) => {
      return {
        _id: `${ele._id}`,
        host: ele.host,
        name: ele.name,
        createdAt: dayjs(ele.createdAt).toString(),
        updatedAt: dayjs(ele.updatedAt).toString(),
        isStarter: ele.isStarter || false,
        lastActiveAt: ele.lastActiveAt
          ? dayjs(ele.lastActiveAt).toString()
          : undefined,
      };
    }),
    blocks: txStats,
  };
});
