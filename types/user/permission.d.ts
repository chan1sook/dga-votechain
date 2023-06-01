
import { type Types } from "mongoose";

declare global {
  type UserResponseDataWithIdAndPermissions = UserBasicData & Pick<UserModelData, "permissions"> & {
    _id: string,
  };
}
