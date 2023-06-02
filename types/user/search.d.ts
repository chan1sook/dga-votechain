
import { type Types } from "mongoose";

declare global {
  type UserSearchParams = {
    userid: Types.ObjectId,
    keyword?: string,
    adminOnly?: boolean,
    notSelf?: boolean,
  }
  
  type UserSearchResponseData = {
    _id: string,
    role: UserRole,
  } & UserBasicData;
}
