import { createLTTB, type Indexable } from "downsample";

const lttbCpuUsagePercent = createLTTB<ServerMetrics>({
  x(data: ServerMetrics) {
    return data.cpuUsagePercent;
  },
  y(data: ServerMetrics) {
    return data.createdAt.getTime();
  },
});

const lttbRamUsagePercent = createLTTB<ServerMetrics>({
  x(data: ServerMetrics) {
    return data.ramUsagePercent;
  },
  y(data: ServerMetrics) {
    return data.createdAt.getTime();
  },
});

const lttbDiskUsagePercent = createLTTB<ServerMetrics>({
  x(data: ServerMetrics) {
    return data.diskUsagePercent;
  },
  y(data: ServerMetrics) {
    return data.createdAt.getTime();
  },
});

function toArray<T>(a: Indexable<T>) {
  return new Array(a.length).fill(undefined).map((_, i) => a[i]);
}

export function downsamplingMonitorLogs(
  logs: ServerMetrics[],
  sampling = 1000
) {
  const cpuLogs = lttbCpuUsagePercent(logs, sampling);
  const ramLogs = lttbRamUsagePercent(logs, sampling);
  const diskLogs = lttbDiskUsagePercent(logs, sampling);

  return {
    cpuLogs: toArray(cpuLogs).map((ele) => {
      return [ele.createdAt.getTime(), ele.cpuUsagePercent];
    }),
    ramLogs: toArray(ramLogs).map((ele) => {
      return [
        ele.createdAt.getTime(),
        ele.ramUsagePercent,
        ele.ramUsage,
        ele.ramTotal,
      ];
    }),
    diskLogs: toArray(diskLogs).map((ele) => {
      return [
        ele.createdAt.getTime(),
        ele.diskUsagePercent,
        ele.diskUsage,
        ele.diskTotal,
      ];
    }),
  };
}
