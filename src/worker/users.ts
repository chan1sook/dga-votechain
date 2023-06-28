
import nodeCron from 'node-cron';

import UserModel from "~/src/models/user"
import mongoose from 'mongoose';

async function cleanRemovedUsers() {
  console.log(`[User Workers] Begin Clean Removed Users Routine`);
  
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const removedUsers = await UserModel.find({
    removeAt: { $lte: new Date() },
    removed: { $ne: true }
  });
  
  for(const user of removedUsers) {
    user.authSources = [];
    user.permissions = [];

    user.firstName = undefined;
    user.lastName = undefined;
    user.email = undefined;
    user.isGovOfficer = undefined;
    user.cidHashed = undefined;
    user.ministry = undefined;
    user.department = undefined;
    user.division = undefined;

    user.preferences = {
      topMenus: [],
      adminTopMenus: [],
      devTopMenus: [],
    }

    user.bannedUntil = undefined;
    user.removed = true;
  }
  
  await UserModel.bulkSave(removedUsers);
  
  await dbSession.commitTransaction();
  await dbSession.endSession();

  console.log(`[User Workers] Clean ${removedUsers.length} User(s)`);
}

async function cleanBannedUsers() {
  console.log(`[User Workers] Begin Unbanned Users Routine`);
  
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const bannedUsers = await UserModel.find({
    bannedUntil: { $gte: new Date() }
  });
  
  for(const user of bannedUsers) {
    user.bannedUntil = undefined;
  }
  
  await UserModel.bulkSave(bannedUsers);
  
  await dbSession.commitTransaction();
  await dbSession.endSession();

  console.log(`[User Workers] Unbanned ${bannedUsers.length} User(s)`);
}

function worker() {
  try {
    cleanRemovedUsers();
  } catch(err) {
    console.log(`[User Workers] Failed`);
    console.error(err)
  }
}

function worker2() {
  try {
    cleanBannedUsers();
  } catch(err) {
    console.log(`[User Workers] Failed`);
    console.error(err)
  }
}

export default function initUserWorkers() {
  worker();
  worker2();
  return [
    nodeCron.schedule('0 * * * *', worker),
    nodeCron.schedule('* * * * *', worker2)
  ];
}