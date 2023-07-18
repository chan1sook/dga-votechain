import { type Types } from "mongoose";

declare global {
  type UserBasicData = Pick<UserModelData, "firstName" | "lastName" | "email">;

  type UserBasicDataWithId = UserBasicData & {
    _id: Types.ObjectId;
  };

  type UserBasicResponseDataWithId = UserBasicData & {
    _id: string;
  };
}
