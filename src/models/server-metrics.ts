import { model, Schema } from "mongoose";

const schema = new Schema<ServerMetrics>(
  {
    source: {
      type: String,
      required: true,
    },
    cpuUsagePercent: {
      type: Number,
    },
    ramUsage: {
      type: Number,
    },
    ramTotal: {
      type: Number,
    },
    ramUsagePercent: {
      type: Number,
    },
    diskUsage: {
      type: Number,
    },
    diskTotal: {
      type: Number,
    },
    diskUsagePercent: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

schema.index({ source: 1, createdAt: 1 });

export default model("server-metrics", schema);
