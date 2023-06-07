import UserModel from "~/src/models/user"
import TopicModel from "~/src/models/topic"
import NotificationModel from "~/src/models/notification"
import BlockchainServerModel from "~/src/models/blockchain-server"
import { combinePermissions, legacyRoleToPermissions } from '~/src/services/transform/permission';

let migrationSeq = 0;

export async function setPredefinedDevs(ids: DigitalIdUserId[]) {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Add Predefined Dev Users`);
  
  const userDocs = await UserModel.find({
    authSources: { $elemMatch: 
      {
        authSource: "digitalId",
        digitalIdUserId:  { $in: ids }
      }
    }
  });

  const userDocsToSave = [];

  for(const id of ids) {
    const targetDoc = userDocs.find((doc) => {
      return doc.authSources.some((authSource) => authSource.digitalIdUserId === id);
    });

    if(targetDoc) {
      targetDoc.permissions = combinePermissions(targetDoc.permissions, ...legacyRoleToPermissions("developer"));
      userDocsToSave.push(targetDoc);
    } else {
      const userDoc = new UserModel({
        permissions: legacyRoleToPermissions("developer"),
        authSources: [
          { authSource: "digitalId", digitalIdUserId: id }
        ]
      });
      userDocsToSave.push(userDoc);
    }
  }

  const result = await UserModel.bulkSave(userDocsToSave);
  console.log(`[Migration] Add Predefined Dev Users (Inserted: ${result.insertedCount})`);
}

export async function setPredefinedBlockchainServers() {
  migrationSeq +=1 ;

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

export async function purgeOldNotifications() {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Purge old Notifications`);
  const res = await NotificationModel.deleteMany({ from: "server" });
  console.log(`[Migration] Purge old Notifications (Deleted: ${res.deletedCount})`);
}

export async function addTopicFields() {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Add Topic Fields`);
  
  const topics = await TopicModel.find({ 
    $or: [
      { durationMode: { $exists: false } },
      { defaultVotes: { $exists: false } }
    ]
  });

  const topicsToSave = [];
  for(const topic of topics) {
    if(!topic.durationMode) {
      topic.durationMode = "startDuration";
    }
    if(!topic.defaultVotes) {
      topic.defaultVotes = 1;
    }
    topicsToSave.push(topic)
  }
  
  const result = await TopicModel.bulkSave(topicsToSave);
  console.log(`[Migration] Add Topic Fields (Updated: ${result.modifiedCount})`);
}