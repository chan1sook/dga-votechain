
import { type Types } from "mongoose";

declare global {
  type UserSearchQueryParams = {
    keyword?: string
  }

  type UserBasicData = Pick<UserModelData, "firstName" | "lastName" | "email">;
  
  type UserSearchResponseData = {
    _id: string,
    role: UserRole,
  } & UserBasicData;

  type UserPermissionsResponseData = UserBasicData & Pick<UserModelData, "permissions"> & {
    _id: string,
  };
  
  type UserBasicDataWithId = UserBasicData & {
    _id: Types.ObjectId
  };

  
  type UserBasicResponseDataWithId = UserBasicData & {
    _id: string,
  };
}
