import BlockchainServerModel from "~/src/models/blockchain-server";
import { isBannedUser } from "~/src/services/validations/user";
import { isUserDeveloper } from "~/src/services/validations/role";
import { BLOCKCHAIN_SERVERS } from "~/src/defaults";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if (!userData || isBannedUser(userData) || !isUserDeveloper(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const param = await readBody(event);
  const target = await BlockchainServerModel.findById(param._id);
  if (!target) {
    throw createError({
      statusCode: 404,
      statusMessage: "Server not found",
    });
  }

  target.deleteOne();

  return {
    status: "OK",
  };
});
