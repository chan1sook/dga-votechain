import mongoose from 'mongoose'
import io from "~/server/socketio"
import smartContract from '../smart-contract';
import { setPredefinedDevs, setPredefinedBlockchainServers, updatePreferenceMenu, updatePermissions, updateTopics } from '../migrations';
import { initFirebase } from '../firebase';
import initBlockchainHbWorkers from '../../src/worker/blockchain-hb';
import initNotificationWorkers from '../../src/worker/notification';
import initUserWorkers from '~/src/worker/users';

export default defineNitroPlugin(async (nitroApp) => {
  console.log("[Config] View Config");
  const runtimeConfig = useRuntimeConfig();
  console.log(runtimeConfig);

  console.log("[Blockchain] Test");
  smartContract.test();

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
  await updateTopics();
  await updatePermissions();
  await updatePreferenceMenu();

  initBlockchainHbWorkers();
  console.log('[BlockchainServerHB Workers] Started!');
  initNotificationWorkers();
  console.log('[Notification Workers] Started!');
  initUserWorkers();
  console.log('[User Workers] Started!');
});