import mongoose from 'mongoose'
import UserModel from "~~/server/models/user"
import { combinePermissions, legacyRoleToPermissions } from '~~/src/utils/permissions';
import io from "~~/server/socketio"

let migrationSeq = 0;

async function setPredefinedDevs(ids: Array<DigitalIDUserId>) {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Add Predefined Dev Users`);
  const result = await UserModel.bulkWrite(ids.map((userid) => {
    return {
      updateOne: {
        filter: { userid },
        update: {
          $set: {
            permissions: legacyRoleToPermissions("developer"),
          },
          $setOnInsert: {
            userid,
          }
        },
        upsert: true,
      }
    }
  }))

  console.log('[Migration] Add Predefined Dev Users', result);
}

async function migrateOldUserRole() {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Legacy Role to Permissions`);
  const allUsers = await UserModel.find({ role: { $exists: true }});

  for(const user of allUsers) {
    if(user.role) {
      user.permissions = legacyRoleToPermissions(user.role);
      user.role = undefined;
    }
  }
  const { modifiedCount, matchedCount }= await UserModel.bulkSave(allUsers);
  console.log(`[Migration] Match: ${matchedCount} / Updated: ${modifiedCount}`);
  console.log('[Migration] Permissions Migration Completed');

}

async function migrateNewPermission() {
  migrationSeq +=1 ;

  console.log(`[Migration] ${migrationSeq}. Add New Permissions Start`);
  const allUsers = await UserModel.find({});

  for(const user of allUsers) {
    user.permissions = combinePermissions(user.permissions, "access-notifications");
  }
  const { modifiedCount, matchedCount }= await UserModel.bulkSave(allUsers);
  console.log(`[Migration] Match: ${matchedCount} / Updated: ${modifiedCount}`);
  console.log('[Migration] Add Predefined Permissions Completed');
}

export default defineNitroPlugin(async (nitroApp) => {
  io();
  
  console.log("[Config] View Config");
  const { MONGODB_URI, DB_NAME, DID_LOGIN_CALLBACK, PREDEFINED_DEV_USERS, public: { DID_API_URL, SOCKETIO_URL } } = useRuntimeConfig();

  console.log(`MONGODB_URI: ${MONGODB_URI}`);
  console.log(`DB_NAME: ${DB_NAME}`);
  console.log(`DID_API_URL: ${DID_API_URL}`);
  console.log(`DID_LOGIN_CALLBACK: ${DID_LOGIN_CALLBACK}`);
  console.log(`SOCKETIO_URL: ${SOCKETIO_URL}`);

  console.log("[MongoDB] Init");

  await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
  console.log('[MongoDB] Connected!');

  await setPredefinedDevs(PREDEFINED_DEV_USERS);
  await migrateOldUserRole();
  await migrateNewPermission();
});