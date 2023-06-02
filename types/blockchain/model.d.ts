import { Model, Types, Query, Document } from "mongoose";

declare global {
  interface BlockchainServerData {
    _id?: Types.ObjectId,
    host: string,
    createdAt: Date,
    updatedAt: Date,
    lastActiveAt?: Date,
  }
}