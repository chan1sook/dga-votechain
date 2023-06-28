import { model, Schema } from "mongoose";

const schema = new Schema<CustomizationModelData>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Schema.Types.Mixed,
  }
}, { timestamps: true });

export default model<CustomizationModelData>('customization', schema);