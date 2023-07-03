import UserModel from "~/src/models/user"
import TopicModel from "~/src/models/topic"
import BlockchainServerModel from "~/src/models/blockchain-server"
import { combinePermissions, removePermissions } from '~/src/services/transform/permission';
import { getDefaultInternalTopicFilter } from "~/src/services/form/topic";
import { updateConfigurations, getConfigurations, applyConfigurations } from "~/src/services/fetch/config";
import { thaiLocalTimeToGMT } from "~/src/services/transform/localtime";

let migrationSeq = 0;

export async function initConfigs() {
  
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Init Configs`);

  const result = await updateConfigurations({
    "offlineMode": true,
    "offlineRange": [
      thaiLocalTimeToGMT(2023, 5, 30, 18, 0),
      thaiLocalTimeToGMT(2023, 6, 2, 23, 59, 59, 999)
    ],
  }, true);

  applyConfigurations();

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

export async function updateTopics() {
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Update Topics`);

  const topics = await TopicModel.find({
    $or: [
      { internalFilter: { $exists: false } },
      { publicVote: { $exists: true } },
    ]
  });

  for(const topic of topics) {
    topic.type = topic.publicVote ? "public" : "private";
    topic.publicVote = undefined;
    topic.internalFilter = getDefaultInternalTopicFilter();
  }
  
  const result = await TopicModel.bulkSave(topics);

  console.log(`[Migration] Update Topics (Updated: ${result.modifiedCount})`);
}

export async function updatePermissions() {
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Update Permissions`);

  const users = await UserModel.find({});
  for(const user of users) {
    user.permissions = removePermissions(user.permissions, "request-topic", "change-permissions:basic", "change-permissions:advance")
    
    if(user.permissions.includes("admin-mode")) {
      user.permissions = combinePermissions(user.permissions, "control-topic")
    }
    if(user.permissions.includes("dev-mode")) {
      user.permissions = combinePermissions(user.permissions, "create-news", "change-news", "change-permissions")
    } else {
      user.permissions = removePermissions(user.permissions, "create-news", "change-news")
    }
    
    user.markModified("permissions")
  }
  
  const result = await UserModel.bulkSave(users);

  console.log(`[Migration] Update Permissions (Updated: ${result.modifiedCount})`);
}