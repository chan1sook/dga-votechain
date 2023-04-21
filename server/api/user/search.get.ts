import EVoteUserModel from "~~/server/models/user"
import { escapeRegExp } from "~~/src/utils/utils";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  let keyword = "";
  if(typeof query.keyword === "string") {
    keyword = query.keyword;
  }
  
  const docQuery = keyword ? {
    $or: [
      { firstName: new RegExp(escapeRegExp(keyword)) },
      { lastName: new RegExp(escapeRegExp(keyword)) },
      { email: new RegExp(escapeRegExp(keyword)) }
    ]
  } : {};
  console.log(docQuery);

  const userDocs = await EVoteUserModel.find(docQuery).limit(20);

  const users : Array<UserSearchResponseData> = userDocs.map((data) => {
    return {
      _id: `${data._id}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    }
  });

  return users;
})