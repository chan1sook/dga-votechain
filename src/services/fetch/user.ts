import { FilterQuery } from "mongoose";
import UserModel from "~/src/models/user";
import { escapeRegExp } from "~/src/services/formatter/regexp";

export function searchUsers(params: UserSearchParams) {
  let docQuery : FilterQuery<UserModelData> = {};
  if(params.keyword) {
    const regExp = new RegExp(escapeRegExp(params.keyword));
    docQuery.$or = [
      { firstName: regExp },
      { lastName: regExp },
      { email: regExp }
    ]
  };
  
  if(params.adminOnly === true) {
    docQuery.permissions = "admin-mode";
  }

  if(params.notSelf === true) {
    docQuery._id = { $ne : params.userid };
  }
  
  return UserModel.find(docQuery);
}