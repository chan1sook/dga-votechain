import dayjs from "dayjs";
import ServerMetricsModel from "~/src/models/server-metrics";

export function getLastestMetricsByDuration(
  durationMs: number,
  source: string
) {
  return ServerMetricsModel.find({
    source,
    createdAt: { $gte: dayjs().subtract(durationMs).toDate() },
  }).sort({ createdAt: -1 });
}
