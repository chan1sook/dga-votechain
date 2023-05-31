import { FilterQuery } from "mongoose";
import EVoteUserModel from "~~/server/models/user"
import { escapeRegExp } from "~~/src/utils/utils";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const query = getQuery(event);

  let keyword = "";
  if(typeof query.keyword === "string") {
    keyword = query.keyword;
  }

  let adminOnly = false;
  let notSelf = false;

  if(query.adminOnly === "1") {
    adminOnly = true;
  }
  if(query.notSelf === "1") {
    notSelf = true;
  }
  
  const docQuery : FilterQuery<UserModelData> = keyword ? {
    $or: [
      { firstName: new RegExp(escapeRegExp(keyword)) },
      { lastName: new RegExp(escapeRegExp(keyword)) },
      { email: new RegExp(escapeRegExp(keyword)) }
    ]
  } : {};

  if(adminOnly) {
    docQuery.permissions = "admin-mode";
  }

  if(notSelf) {
    docQuery._id = { $ne : userData._id };
  }

  console.log(docQuery);
  
  const userDocs = await EVoteUserModel.find(docQuery).limit(20);

  const users : Array<UserSearchResponseData> = userDocs.map((data) => {
    const role : UserRole = data.permissions.includes("dev-mode") ? "developer" : (data.permissions.includes("admin-mode") ? "admin" : "voter");
    return {
      _id: `${data._id}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role,
    }
  });

  return users;
})