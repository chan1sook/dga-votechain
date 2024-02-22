import { model, Schema } from "mongoose";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

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
schema.index(
  { createdAt: 1 },
  { expireAfterSeconds: dayjs.duration({ years: 1 }).asSeconds() }
);

export default model("server-metrics", schema);
