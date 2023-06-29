import UserModel from "~/src/models/user"

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { isThaiCitizenId } from "~/src/services/validations/user";
import isEmail from 'validator/lib/isEmail';

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

  const userEditFormData : UserEditFormData = await readBody(event);
  
  const userDoc = await UserModel.findById(userData._id);
  if(!userDoc) {
    throw createError({
      statusCode: 500,
      statusMessage: "Invalid User",
    });
  }

  if(userEditFormData.firstName) {
    userDoc.firstName = userEditFormData.firstName;
  }
  if(userEditFormData.lastName) {
    userDoc.lastName = userEditFormData.lastName;
  }
  if(userEditFormData.citizenid) {
    if(!isThaiCitizenId(userEditFormData.citizenid)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid Input",
      });
    }
    userDoc.cidHashed = await bcrypt.hash(userEditFormData.citizenid, CITIZENID_FIXED_SALT);
  }
  
  if(userEditFormData.email) {
    if(!isEmail(userEditFormData.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid Input",
      });
    }
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