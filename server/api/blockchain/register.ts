import dayjs from "dayjs";
import BlockchainServerModel from "~/src/models/blockchain-server";
import { isBlockchainServerDataValid } from "~/src/services/validations/blockchain-server";
import { isBannedUser } from "~/src/services/validations/user";
import { isUserDeveloper } from "~/src/services/validations/role";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if (!userData || isBannedUser(userData) || !isUserDeveloper(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const param = await readBody(event);

  if (
    !isBlockchainServerDataValid({
      host: param.host,
      name: param.name,
    })
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server data invalid",
    });
  }

  const blockchainServerData = new BlockchainServerModel({
    host: param.host,
    name: param.name,
  });

  await blockchainServerData.save();

  return {
    server: {
      _id: `${blockchainServerData._id}`,
      host: blockchainServerData.host,
      name: blockchainServerData.name,
      createdAt: dayjs(blockchainServerData.createdAt).toString(),
      updatedAt: dayjs(blockchainServerData.updatedAt).toString(),
      lastActiveAt: blockchainServerData.lastActiveAt
        ? dayjs(blockchainServerData.lastActiveAt).toString()
        : undefined,
    },
  };
});
