import BlockchainServerModel from "~/src/models/blockchain-server"
import UserModel from "~/src/models/user"
import { getFastConfiguration, loadServerConfigurations, updateConfigurations } from "~/src/services/fetch/config";
import { getDefaultAdminTopMenus, getDefaultDevTopMenus, getDefaultTopMenus } from "~/src/services/form/preference";
import { checkPermissionNeeds } from "~/src/services/validations/permission";

let migrationSeq = 0;

export async function initConfigs() {
  
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Init Configs`);
  
  await loadServerConfigurations();
  const result = await updateConfigurations(getFastConfiguration(), true);

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

export async function changeTopMenuConfig() {
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. ChangeTopMenuConfig`);
  
  const userDocs = await UserModel.find();
  for(const user of userDocs) {
    if(!user.preferences) {
      user.preferences = {
        topMenu: [],
      } 
    }
    if(!Array.isArray(user.preferences.topMenu) || user.preferences.topMenu.length === 0) {
      if(checkPermissionNeeds(user.permissions, "dev-mode")) {
        user.preferences.topMenu = getDefaultDevTopMenus();
      } else if(checkPermissionNeeds(user.permissions, "admin-mode")) {
        user.preferences.topMenu = getDefaultAdminTopMenus();
      } else {
        user.preferences.topMenu = getDefaultTopMenus();
      }
    }
  }
  const result = await UserModel.bulkSave(userDocs);
  console.log(`[Migration] ChangeTopMenuConfig (Updated: ${result.modifiedCount})`);
}