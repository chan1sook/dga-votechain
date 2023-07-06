import mongoose from 'mongoose'
import io from "~/server/socketio"
import smartContract from '../smart-contract';
import { initConfigs, setPredefinedBlockchainServers } from '../migrations';
import initBlockchainHbWorkers from '../../src/worker/blockchain-hb';
import initNotificationWorkers from '../../src/worker/notification';
import initUserWorkers from '~/src/worker/users';

export default defineNitroPlugin(async (nitroApp) => {
  console.log("[Config] View Config");
  const runtimeConfig = useRuntimeConfig();
  console.log(runtimeConfig);
  
  console.log("[Blockchain] Test");
  smartContract.test();

  console.log("[SocketIO] Init");
  await io();

  console.log("[MongoDB] Init");
  await mongoose.connect(`${runtimeConfig.MONGODB_URI}`, {
    dbName: runtimeConfig.DB_NAME,
  });
  console.log('[MongoDB] Connected!');

  await initConfigs();
  await setPredefinedBlockchainServers();

  initBlockchainHbWorkers();
  console.log('[BlockchainServerHB Workers] Started!');
  initNotificationWorkers();
  console.log('[Notification Workers] Started!');
  initUserWorkers();
  console.log('[User Workers] Started!');
});