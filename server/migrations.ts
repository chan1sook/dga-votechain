import bcrypt from "bcrypt";

import EVoteUserModel from "~~/server/models/user"
import TopicModel from "~~/server/models/topic"
import BlockchainServerModel from "~~/server/models/blockchain-server"
import { combinePermissions, getUnusedPermissions, legacyRoleToPermissions, removePermissions } from '~~/src/utils/permissions';

let migrationSeq = 0;

export async function setPredefinedDevs(ids: Array<DigitalIDUserId>) {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Add Predefined Dev Users`);
  
  const userDocs = await EVoteUserModel.find({
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
      const userDoc = new EVoteUserModel({
        permissions: legacyRoleToPermissions("developer"),
        authSources: [
          { authSource: "digitalId", digitalIdUserId: id }
        ]
      });
      userDocsToSave.push(userDoc);
    }
  }

  const result = await EVoteUserModel.bulkSave(userDocsToSave);
  console.log(`[Migration] Add Predefined Dev Users (Inserted: ${result.insertedCount})`);
}

export async function migrateToNewUserFormat2() {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. migrateToNewUserFormat2`);
  
  const userDocs = await EVoteUserModel.find({});
  const userDocsToSave = [];

  const unusedPermissions = getUnusedPermissions();

  for(const userDoc of userDocs) {
    if(userDoc.citizenId) {
      userDoc.hashedCitizenId = bcrypt.hashSync(userDoc.citizenId, 12);
      userDoc.citizenId = undefined;
    }

    userDoc.permissions = removePermissions(userDoc.permissions, ...unusedPermissions);
    
    if(userDoc.permissions.includes("voter-mode")) {
      userDoc.permissions = combinePermissions(userDoc.permissions, "request-topic");
    }
    
    userDoc.markModified("permissions");
    userDocsToSave.push(userDoc);
  }

  const result = await EVoteUserModel.bulkSave(userDocsToSave);
  console.log(`[Migration] migrateToNewUserFormat2 (Modified: ${result.modifiedCount})`);
}

export async function migrateTopicsDefaultAdmin() {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Add default admin to topics`);
  
  const topicDocs = await TopicModel.find({
    admin: { $exists: false }
  });
  const topicDocsToSave = [];

  for(const topicDoc of topicDocs) {
    topicDoc.admin = topicDoc.createdBy;
    topicDocsToSave.push(topicDoc);
  }

  const result = await TopicModel.bulkSave(topicDocsToSave);
  console.log(`[Migration] migrateTopicsDefaultAdmin (Modified: ${result.modifiedCount})`);
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