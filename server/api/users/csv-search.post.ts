import { readFiles } from 'h3-formidable'
import fs from "fs/promises";
import { parse } from 'csv';
import { Readable } from "stream";

import { batchSearchActiveUserByKeywords } from "~/src/services/fetch/user";
import { isUserAdmin, isUserDeveloper } from '~/src/services/validations/role';
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;

  if(!userData || isBannedUser(userData) || !isUserAdmin(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const { fields, files } = await readFiles(event, {
    includeFields: true
  })

  const file = files.csv[0];

  if(!file) {
    throw createError({
      statusMessage: "No CSV File",
      statusCode: 400,
    })
  }
  const query = getQuery(event);
  const adminOnly = query.adminOnly === "1";
  const excludeUserId = query.notSelf === "1" ? userData._id : undefined;
  
  const tempFile = await fs.readFile(file.filepath);

  const userSearchKeywords = await new Promise<CSVSearchParams[]>((resolve, reject) => {
    const searchParams: CSVSearchParams[] = [];

    Readable.from(tempFile).pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", (row) => {
        let voteCount : number | undefined = parseInt(row[1]);
        if(!Number.isInteger(voteCount) || voteCount <= 0) {
          voteCount = undefined;
        }
        searchParams.push({
          citizenid: row[0],
          names: row[1],
          email: row[2],
          voteCount: voteCount,
        })
      })

      .on("finish", () => {
        resolve(searchParams);   
      })
      .on("error", reject);
  });
  
  const searchUsers = await batchSearchActiveUserByKeywords(userSearchKeywords, { adminOnly, excludeUserId });
  
  const users = searchUsers.map((user) => {
    let role : UserRole | undefined;
    if(isUserDeveloper(userData)) {
      role = isUserDeveloper(user.user) ? "developer" :
        (isUserAdmin(user.user) ? "admin" : "voter");
    }
    
    return {
      _id: `${user.user._id}`,
      firstName: user.user.firstName,
      lastName: user.user.lastName,
      email: user.user.email,
      role,
      vote: user.vote,
    }
  })
  

  return users;
})