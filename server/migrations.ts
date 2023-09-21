import UserModel from "~/src/models/user";
import BlockchainServerModel from "~/src/models/blockchain-server";
import {
  getFastConfiguration,
  loadServerConfigurations,
  updateConfigurations,
} from "~/src/services/fetch/config";
import { BLOCKCHAIN_SERVERS } from "~/src/defaults";

let migrationSeq = 0;

export async function initConfigs() {
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Init Configs`);

  await loadServerConfigurations();
  const result = await updateConfigurations(getFastConfiguration(), true);

  console.log(
    `[Migration] Init Configs (Inserted: ${result.insertedCount}, Updated: ${result.insertedCount})`
  );
}

export async function setPredefinedBlockchainServers() {
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. Add Predefined Blockchain Servers`);

  const servers = await BlockchainServerModel.find({
    host: { $in: BLOCKCHAIN_SERVERS.map((ele) => ele.host) },
  });

  const modifiedServers = [];
  for (const data of BLOCKCHAIN_SERVERS) {
    const serverTarget = servers.find((sv) => sv.host === data.host);
    if (serverTarget) {
      serverTarget.name = data.name;
      modifiedServers.push(serverTarget);
    } else {
      modifiedServers.push(new BlockchainServerModel(data));
    }
  }
  const result = await BlockchainServerModel.bulkSave(modifiedServers);
  console.log(
    `[Migration] Add Predefined Blockchain Servers (Inserted: ${result.insertedCount}, Updated: ${result.modifiedCount})`
  );
}

export async function migrateDuplicateUsers() {
  migrationSeq += 1;

  console.log(`[Migration] ${migrationSeq}. migrateDuplicateUsers`);
  // 1. fetch all user or group
  const [problemUsers, newUsers] = await Promise.all([
    UserModel.find({
      cidHashed: { $exists: false },
      removeAt: { $exists: false },
    }),
    UserModel.find({
      cidHashed: { $exists: true },
      removeAt: { $exists: false },
    }),
  ]);

  // 2. Fix 1
  const editUsers = [];
  const removeUsers = [];
  const remainUsers = newUsers.slice();

  for (const user of problemUsers) {
    const targetUser = remainUsers.find(
      (ele) =>
        ele.firstName === user.firstName && ele.lastName === user.lastName
    );

    if (targetUser) {
      user.cidHashed = targetUser.cidHashed;
      editUsers.push(user);

      if (!removeUsers.includes(targetUser)) {
        removeUsers.push(targetUser);
        remainUsers.splice(remainUsers.indexOf(targetUser), 1);
      }
    }
  }

  const [result1, result2] = await Promise.all([
    UserModel.bulkSave(editUsers),
    UserModel.bulkWrite(
      removeUsers.map((ele) => {
        return { deleteOne: { _id: ele._id } };
      })
    ),
  ]);

  console.log(
    `[Migration] migrateDuplicateUsers (Fixed: ${result1.modifiedCount}/${problemUsers.length})`
  );
}
