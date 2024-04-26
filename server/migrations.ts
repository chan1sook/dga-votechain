import fs from "fs/promises";
import UserModel from "~/src/models/user";
import BlockchainServerModel from "~/src/models/blockchain-server";
import {
  getFastConfiguration,
  loadServerConfigurations,
  updateConfigurations,
} from "~/src/services/fetch/config";

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

  const configPath = useRuntimeConfig().BLOCKCHAIN_HOST_CONFIG_PATH;

  try {
    console.log(`[Migration] Read Server config file`, configPath);

    const fileContent = (await fs.readFile(configPath)).toString();
    const starterServers = JSON.parse(fileContent) as {
      host: string;
      name: string;
    }[];
    const oldServers = await BlockchainServerModel.find({});

    const modifiedServers = oldServers;
    for (const server of oldServers) {
      server.isStarter = false;
    }

    for (const data of starterServers) {
      const serverTarget = oldServers.find((sv) => sv.host === data.host);
      if (serverTarget) {
        serverTarget.name = data.name;
        serverTarget.isStarter = true;
      } else {
        modifiedServers.push(
          new BlockchainServerModel({ ...data, isStarter: true })
        );
      }
    }

    const result = await BlockchainServerModel.bulkSave(modifiedServers);
    console.log(
      `[Migration] Add Predefined Blockchain Servers (Inserted: ${result.insertedCount}, Updated: ${result.modifiedCount})`
    );
  } catch (err) {
    console.error(err);
    console.log(`[Migration] Config file not found`);
  }
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
  const removeUsers: any[] = [];
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
