import { type Types } from "mongoose";

declare global {
  type UserSearchParams = {
    keyword: string;
    adminOnly?: boolean;
    excludeUserId?: Types.ObjectId;
  };

  type UserSearchResponseData = {
    _id: string;
    role?: UserRole;
    vote?: number;
    authSources?: UserAuthSource[];
  } & UserBasicData;

  interface CSVSearchParams {
    citizenid?: string;
    names?: string;
    email?: string;
    voteCount?: number;
  }
}
