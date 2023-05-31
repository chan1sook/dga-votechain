import UserModel from "~~/server/models/user"

import mongoose from "mongoose";
import { hashSync } from "bcrypt";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  const { BCRYPT_SALT_ROUND } = useRuntimeConfig();

  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const userEditFormData : UserEditFormData = await readBody(event);
  
  const userDoc = await UserModel.findById(userData._id);
  if(!userDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Your user id not found",
    });
  }

  if(userEditFormData.firstName) {
    userDoc.firstName = userEditFormData.firstName;
  }
  if(userEditFormData.lastName) {
    userDoc.lastName = userEditFormData.lastName;
  }
  if(userEditFormData.citizenid) {
    userDoc.hashedCitizenId = hashSync(userEditFormData.citizenid, BCRYPT_SALT_ROUND);
  }
  if(userEditFormData.email) {
    userDoc.email = userEditFormData.email;
  }
  if(userEditFormData.isGovOfficer !== undefined) {
    userDoc.isGovOfficer = userEditFormData.isGovOfficer;
    if(userDoc.isGovOfficer) {
      if(userEditFormData.ministry) {
        userDoc.ministry = userEditFormData.ministry;
      }
      if(userEditFormData.department) {
        userDoc.department = userEditFormData.department;
      }
      if(userEditFormData.ministry) {
        userDoc.division = userEditFormData.division;
      }
    } else {
      userDoc.ministry = undefined;
      userDoc.department = undefined;
      userDoc.division = undefined;
    }
  }

  await userDoc.save();

  await dbSession.commitTransaction();
  await dbSession.endSession();
  
  return {
    status: "OK",
  }
})