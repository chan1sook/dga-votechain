import EVoteUserModel from "~~/server/models/user"

export default defineEventHandler(async (event) => {
  const hints : Array<TopicVoterAllowFormDataWithHint> = await readBody(event);

  const cursor = EVoteUserModel.find().batchSize(1000).cursor();
  const userDocs = [];
  
  let doc = await cursor.next();
  while(doc !== null) {
    const isFind = hints.some((ele) => {
      if(ele.userid === doc._id.toString()) { return true }
      if(ele.firstName && doc.firstName && ele.lastName && doc.lastName && ele.firstName === doc.firstName && ele.lastName === doc.lastName) {
        return true;
      }
      if(ele.email && doc.email && ele.email === doc.email) {
        return true;
      }
      return false;
    });
    if(isFind) {
      userDocs.push(doc);
    }
    doc = await cursor.next();
  }
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