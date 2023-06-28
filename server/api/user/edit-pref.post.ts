import UserModel from "~/src/models/user"

import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const prefData : UserPreferenceFormData = await readBody(event);
  
  const userDoc = await UserModel.findById(userData._id);
  if(!userDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Your user id not found",
    });
  }


  userDoc.preferences = Object.assign({...userDoc.preferences}, prefData.preferences);
  userDoc.markModified("preferences");
  
  await userDoc.save();

  await dbSession.commitTransaction();
  await dbSession.endSession();
  
  return {
    status: "OK",
  }
})