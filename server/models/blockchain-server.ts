import { model, Schema } from "mongoose";

const schema = new Schema<BlockchainServerData, BlockchainServerModel>({
  host: {
    type: String,
    required: true,
  },
  lastActiveAt: {
    type: Date,
  },
}, { timestamps: true });

export default model<BlockchainServerData, BlockchainServerModel>('blockchain-server', schema);