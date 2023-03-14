import mongoose from 'mongoose'
import UserModel from "~~/src/models/user"
import { legacyRoleToPermissions } from '~~/src/utils/permissions';

export default defineNitroPlugin(async (nitroApp) => {
  console.log("[Config] View Config");
  const { MONGODB_URI, DB_NAME, DID_LOGIN_CALLBACK, public: { DID_API_URL } } = useRuntimeConfig();

  console.log(`MONGODB_URI: ${MONGODB_URI}`);
  console.log(`DB_NAME: ${DB_NAME}`);
  console.log(`DID_API_URL: ${DID_API_URL}`);
  console.log(`DID_LOGIN_CALLBACK: ${DID_LOGIN_CALLBACK}`);

  console.log("[MongoDB] Init");

  await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
  console.log('[MongoDB] Connected!');

  console.log('[Migration] Permissions Migration Start');
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
});