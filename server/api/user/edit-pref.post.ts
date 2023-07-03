import UserModel from "~/src/models/user"

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from 'validator';
import { isThaiCitizenId } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  const { CITIZENID_FIXED_SALT } = useRuntimeConfig();

  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const prefData : UserPreferencesForm = await readBody(event);
  
  const userDoc = await UserModel.findById(userData._id);
  if(!userDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Your user id not found",
    });
  }

  // user Info Edit Part
  if(prefData.userInfo.firstName) {
    userDoc.firstName = prefData.userInfo.firstName;
  }
  if(prefData.userInfo.lastName) {
    userDoc.lastName = prefData.userInfo.lastName;
  }
  if(prefData.userInfo.citizenid) {
    if(!isThaiCitizenId(prefData.userInfo.citizenid)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid Input",
      });
    }
    userDoc.cidHashed = await bcrypt.hash(prefData.userInfo.citizenid, CITIZENID_FIXED_SALT);
  }
  
  if(prefData.userInfo.email) {
    if(!validator.isEmail(prefData.userInfo.email)) {
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

  // part b Pref
  userDoc.preferences.topMenu = prefData.topMenu;
  userDoc.markModified("preferences");
  
  await userDoc.save();

  await dbSession.commitTransaction();
  await dbSession.endSession();
  
  return {
    status: "OK",
  }
})