import UserModel from "~/src/models/user"
import TopicModel from "~/src/models/topic"
import BlockchainServerModel from "~/src/models/blockchain-server"
import { combinePermissions, removePermissions } from '~/src/services/transform/permission';
import { getDefaultInternalTopicFilter } from "~/src/services/form/topic";
import { updateConfigurations } from "~/src/services/fetch/config";
import { thaiLocalTimeToGMT } from "~/src/services/transform/localtime";
import { compareAuthSourceFn } from "~/src/services/validations/user";

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

export async function updateAuthSource() {
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Update authSources`);

  const users = await UserModel.find({});
  for(const user of users) {
    const newAuthSource : UserAuthSourceData[] = [];
    for(const authSource of user.authSources) {
      const isExists = newAuthSource.find((ele) => compareAuthSourceFn(ele, authSource));

      if(!isExists) {
        newAuthSource.push(authSource);
      }
    }
    user.authSources = newAuthSource;
    
    user.markModified("authSources")
  }
  
  const result = await UserModel.bulkSave(users);

  console.log(`[Migration] Update authSources (Updated: ${result.modifiedCount})`);
}