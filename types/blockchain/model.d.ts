import { Model, Types, Query, Document } from "mongoose";

declare global {
  interface BlockchainServerData {
    _id?: Types.ObjectId;
    host: string;
    name: string;
    isStarter: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt?: Date;
  }
}
