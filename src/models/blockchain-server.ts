import { model, Schema } from "mongoose";

const schema = new Schema<BlockchainServerData>(
  {
    name: {
      type: String,
      index: true,
    },
    host: {
      type: String,
      unique: true,
      required: true,
    },
    lastActiveAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model<BlockchainServerData>("blockchain-server", schema);
