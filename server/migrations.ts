import { COOKIE_POLICY_TH, PRIVACY_POLICY_TH } from "~/src/defaults";
import BlockchainServerModel from "~/src/models/blockchain-server"
import { getFastConfiguration, loadServerConfigurations, updateConfigurations } from "~/src/services/fetch/config";

let migrationSeq = 0;

export async function initConfigs() {
  
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Init Configs`);
  
  await loadServerConfigurations();
  const result = await updateConfigurations(getFastConfiguration(), true);
  
  await updateConfigurations({
    cookiePolicyTH: COOKIE_POLICY_TH,
    cookiePolicyEN: "",
    privacyPolicyTH: PRIVACY_POLICY_TH,
    privacyPolicyEN: "",
  }, true)

  console.log(`[Migration] Init Configs (Inserted: ${result.insertedCount}, Updated: ${result.insertedCount})`);
}

export async function setPredefinedBlockchainServers() {
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Add Predefined Blockchain Servers`);
  
  const serverCounts = await BlockchainServerModel.countDocuments();
  let insertedCount = 0;
  
  if(serverCounts === 0) {
    const today = new Date();
    const result = await BlockchainServerModel.insertMany([
      {
        host: "209.15.108.160",
        createdAt: today,
        updatedAt: today,
      },
      {
        host: "164.115.95.57",
        createdAt: today,
        updatedAt: today,
      },
      {
        host: "35.239.20.185",
        createdAt: today,
        updatedAt: today,
      }
    ]);
    insertedCount = result.length;
  }
  console.log(`[Migration] Add Predefined Blockchain Servers (Inserted: ${insertedCount})`);
}