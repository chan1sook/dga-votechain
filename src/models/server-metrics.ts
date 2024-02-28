import { model, Schema } from "mongoose";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const schema = new Schema<ServerMetrics>({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

schema.index({ source: 1, createdAt: 1 });
schema.index(
  { createdAt: 1 },
  { expireAfterSeconds: dayjs.duration({ months: 3 }).asSeconds() }
);

export default model("server-metrics", schema);
