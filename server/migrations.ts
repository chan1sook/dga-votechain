import EVoteUserModel from "~~/server/models/user"
import OldUserModel from "~~/server/models/old-user"
import BlockchainServerModel from "~~/server/models/blockchain-server"
import { checkPermissionSelections, combinePermissions, legacyRoleToPermissions } from '~~/src/utils/permissions';

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

function containsOldPermissions(permissions: Array<EVotePermission>) : boolean {
  const unusedPermissions: Array<EVotePermission> = ["access-pages:user", "access-notifications", "request-topic", "access-pages:admin", "change-permissions:basic", "access-pages:developer", "change-permissions:advance"];
  return permissions.some((ele) => unusedPermissions.includes(ele))
}

function oldPermissionsToRole(permissions: Array<EVotePermission>) : UserRole {
  if(permissions.includes("access-pages:developer")) {
    return "developer";
  }
  if(permissions.includes("access-pages:admin")) {
    return "admin";
  }
  return "voter";
}

export async function migrateToNewUserFormat() {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. MigrateToNewUserFormat`);
  const allUsers = await OldUserModel.find({});

  const result = await EVoteUserModel.bulkWrite(allUsers.map((user) => {
    return {
      updateOne: {
        filter: {
          authSources: { $elemMatch: 
            {
              authSource: "digitalId",
              digitalIdUserId:  { $in: user.userid }
            }
          }
        },
        update: {
          $setOnInsert: {
            permissions: containsOldPermissions(user.permissions) ? 
              legacyRoleToPermissions(oldPermissionsToRole(user.permissions)) : user.permissions,
            authSources: [
              { authSource: "digitalId", digitalIdUserId: user.userid }
            ],
          }
        },
        upsert: true,
      }
    }
  }))

  console.log(`[Migration] MigrateToNewUserFormat (Upserted: ${result.upsertedCount}) (Modified: ${result.modifiedCount})`);
}

export async function migrateChangedPermissions() {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Add Predefined Dev Users`);
  
  const userDocs = await EVoteUserModel.find({});
  const userDocsToSave = [];

  for(const userDoc of userDocs) {
    if(checkPermissionSelections(userDoc.permissions, "admin-mode")) {
      userDoc.permissions = combinePermissions(userDoc.permissions, "change-permissions:basic");
      userDoc.markModified("permissions");
    }
    if(checkPermissionSelections(userDoc.permissions, "dev-mode")) {
      userDoc.permissions = combinePermissions(userDoc.permissions, "change-permissions:advance");
      userDoc.markModified("permissions");
    }
    userDocsToSave.push(userDoc);
  }

  const result = await EVoteUserModel.bulkSave(userDocsToSave);
  console.log(`[Migration] MigrateChangePermissions (Modified: ${result.modifiedCount})`);
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