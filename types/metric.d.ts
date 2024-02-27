type ServerMetricsQueryParams = {
  duration?: number;
};

interface ServerMetrics {
  source: string;
  cpuUsagePercent: number;
  ramUsage: number;
  ramTotal: number;
  ramUsagePercent: number;
  diskUsage: number;
  diskTotal: number;
  diskUsagePercent: number;
  createdAt: Date;
}

type ServerMetricsResponse = {
  cpuLogs: [number, number][];
  ramLogs: [number, number, number, number][];
  diskLogs: [number, number, number, number][];
};
