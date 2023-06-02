
import nodeCron from 'node-cron';
import axios from "axios";

import BlockchainServerModel from "~~/server/models/blockchain-server"
import { blockchainHbEventEmitter } from './event-emitter';

async function checkHBs() {
  const allServerDocs = await BlockchainServerModel.find();
  for(const doc of allServerDocs) {
    const urlWithPort = new URL("/", `http://${doc.host}:8545`);
    axios.post(urlWithPort.toString(), {
      "jsonrpc": "2.0",
      "method": "admin_nodeInfo",
      "params": [],
      "id": 1
    }, {
      headers: {}
    }).then((res) => {
      doc.lastActiveAt = new Date();
      console.log(`[BlockchainServerHB] HB OK: ${doc.host}`);
      return doc.save()
    }).then((res) => {
      console.log(`[BlockchainServerHB] HB Saved: ${doc.host}`);
      blockchainHbEventEmitter.emit("blockchainHb", doc);
    }).catch((res) => {
      console.log(`[BlockchainServerHB] HB Failed: ${doc.host}`);
    })
  }
}

export default function initHbCheck() {
  checkHBs();
  return nodeCron.schedule('* * * * *', checkHBs);
}