import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { getLastestMetricsByDuration } from "~/src/services/fetch/monitor";
import { downsamplingMonitorLogs } from "~/src/services/transform/monitor";
import { isUserDeveloper } from "~/src/services/validations/role";
import { isBannedUser } from "~/src/services/validations/user";

dayjs.extend(duration);

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  if (!userData || isBannedUser(userData) || !isUserDeveloper(userData)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const { duration }: ServerMetricsQueryParams = getQuery(event);

  let durationMs = duration || dayjs.duration({ months: 1 }).asMilliseconds();

  const metricDocs = await getLastestMetricsByDuration(
    durationMs,
    "DGAServer1"
  );

  const logSets = downsamplingMonitorLogs(metricDocs, 500);

  return {
    metrics: logSets,
  };
});
