import TopicModel from "~/src/models/topic";
import mongoose from "mongoose";
import { checkPermissionSelections } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";
import { isUserDeveloper } from "~/src/services/validations/role";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  if (
    !userData ||
    isBannedUser(userData) ||
    !isUserDeveloper(userData) ||
    !checkPermissionSelections(userData.permissions, "dev-mode", "change-topic")
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const hiddenParameters: { hidden: boolean } = await readBody(event);

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const topicDoc = await TopicModel.findById(event.context.params?.id);
  if (!topicDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Topic not found",
    });
  }

  topicDoc.hidden = !!hiddenParameters.hidden;
  await topicDoc.save();

  await dbSession.commitTransaction();
  await dbSession.endSession();

  return {
    status: "OK",
  };
});
