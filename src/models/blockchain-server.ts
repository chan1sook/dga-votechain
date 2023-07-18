import { model, Schema } from "mongoose";

const schema = new Schema<BlockchainServerData>(
  {
    host: {
      type: String,
      required: true,
    },
    lastActiveAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model<BlockchainServerData>("blockchain-server", schema);
