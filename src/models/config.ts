import { model, Schema } from "mongoose";

const schema = new Schema<ConfigModelData>({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Schema.Types.Mixed,
  }
}, { timestamps: true });

export default model<ConfigModelData>('config', schema);