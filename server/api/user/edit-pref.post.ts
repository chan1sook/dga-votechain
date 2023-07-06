import UserModel from "~/src/models/user"

import mongoose from "mongoose";
import validator from 'validator';

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

  const prefData : Omit<UserPreferencesForm, "firstName" | "lastName"> = await readBody(event);
  
  const userDoc = await UserModel.findById(userData._id);
  if(!userDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Your user id not found",
    });
  }

  // user Info Edit Part
  if(prefData.userInfo.email !== undefined) {
    if(prefData.userInfo.email && !validator.isEmail(prefData.userInfo.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid Input",
      });
    }

    userDoc.email = prefData.userInfo.email;
  }
  
  if(prefData.userInfo.isGovOfficer !== undefined) {
    userDoc.isGovOfficer = prefData.userInfo.isGovOfficer;
    if(userDoc.isGovOfficer) {
      if(prefData.userInfo.ministry) {
        userDoc.ministry = prefData.userInfo.ministry;
      }
      if(prefData.userInfo.department) {
        userDoc.department = prefData.userInfo.department;
      }
      if(prefData.userInfo.ministry) {
        userDoc.division = prefData.userInfo.division;
      }
    } else {
      userDoc.ministry = undefined;
      userDoc.department = undefined;
      userDoc.division = undefined;
    }
  }

  // preferences part
  userDoc.preferences.topMenu = prefData.topMenu;
  
  await userDoc.save();

  await dbSession.commitTransaction();
  await dbSession.endSession();
  
  return {
    status: "OK",
  }
})