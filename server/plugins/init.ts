import mongoose from 'mongoose'
import io from "~/server/socketio"
import smartContract from '../smart-contract';
import { setPredefinedDevs, setPredefinedBlockchainServers, addTopicFields } from '../migrations';
import { initFirebase } from '../firebase';
import initHbCheck from '../blockchain-server-hb';

export default defineNitroPlugin(async (nitroApp) => {
  console.log("[Config] View Config");
  const runtimeConfig = useRuntimeConfig();
  console.log(runtimeConfig);

  console.log("[Blockchain] Test");
  smartContract.init();

  console.log("[Firebase] Init");
  initFirebase();

  console.log("[SocketIO] Init");
  await io();

  console.log("[MongoDB] Init");
  await mongoose.connect(`${runtimeConfig.MONGODB_URI}`, {
    dbName: runtimeConfig.DB_NAME,
  });
  console.log('[MongoDB] Connected!');

  await setPredefinedBlockchainServers();
  await setPredefinedDevs(runtimeConfig.PREDEFINED_DEV_USERS);
  await addTopicFields();

  initHbCheck();
  console.log('[BlockchainServerHB] Started!');
});