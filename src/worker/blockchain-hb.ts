import nodeCron from "node-cron";
import axios from "axios";

import BlockchainServerModel from "~/src/models/blockchain-server";
import { blockchainHbEventEmitter } from "../../server/event-emitter";

async function checkBlockchainHBs() {
  console.log(`[Blockchain HB Workers] Begin HB Routine`);

  const allServerDocs = await BlockchainServerModel.find();

  console.log(`[Blockchain HB Workers] Find ${allServerDocs.length} Server(s)`);

  const updated = await new Promise((resolve, reject) => {
    let updated = 0;
    const promises = [];
    for (const doc of allServerDocs) {
      const urlWithPort = new URL("/", `http://${doc.host}:8545`);

      promises.push(
        axios
          .post(
            urlWithPort.toString(),
            {
              jsonrpc: "2.0",
              method: "admin_nodeInfo",
              params: [],
              id: 1,
            },
            {
              headers: {},
            }
          )
          .then((res) => {
            doc.lastActiveAt = new Date();
            return doc.save();
          })
          .then((res) => {
            updated += 1;
          })
          .catch((res) => {
            // console.log(`[BlockchainServerHB] HB Failed: ${doc.host}`);
          })
      );
    }

    return Promise.all(promises).then(() => {
      resolve(updated);
    });
  });

  console.log(`[Blockchain HB Workers] Updated ${updated} Server(s)`);
}

function worker() {
  try {
    checkBlockchainHBs();
  } catch (err) {
    console.log(`[Blockchain HB Workers] Failed`);
    console.error(err);
  }
}

export default function initBlockchainHbWorkers() {
  checkBlockchainHBs();
  return nodeCron.schedule("* * * * *", worker);
}
