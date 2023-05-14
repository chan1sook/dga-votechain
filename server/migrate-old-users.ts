import EVoteUserModel from "~~/server/models/user"
import OldUserModel from "~~/server/models/old-user"
import { combinePermissions, legacyRoleToPermissions } from '~~/src/utils/permissions';

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

  console.log(`[Migration] MigrateToNewUserFormat (Upserted: ${result.upsertedCount})`);
}