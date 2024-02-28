import nodeCron from "node-cron";
import systeminformation from "systeminformation";
import ServerMetricsModel from "~/src/models/server-metrics";

const cachedMetrics: ServerMetrics[] = [];
async function getSystemInfo() {
  const [mem, currentLoad, fsSize] = await Promise.all([
    systeminformation.mem(),
    systeminformation.currentLoad(),
    systeminformation.fsSize(),
  ]);

  const fsSizeAll = fsSize.reduce(
    (prev, ele) => {
      return {
        used: prev.used + ele.used,
        size: prev.size + ele.size,
      };
    },
    {
      used: 0,
      size: 0,
    }
  );

  const metrics: ServerMetrics = {
    source: "DGAServer1",
    cpuUsagePercent: currentLoad.currentLoad,
    ramUsage: mem.used,
    ramTotal: mem.total,
    ramUsagePercent: (mem.used * 100) / mem.total,
    diskUsage: fsSizeAll.used,
    diskTotal: fsSizeAll.size,
    diskUsagePercent: (fsSizeAll.used * 100) / fsSizeAll.size,
    createdAt: new Date(),
  };

  cachedMetrics.push(metrics);

  if (cachedMetrics.length >= 10) {
    console.log(`[Monitoring Workers] Save 10 Metrics`);

    await ServerMetricsModel.insertMany(cachedMetrics);
    cachedMetrics.splice(0, cachedMetrics.length);
  } else {
    console.log(`[Monitoring Workers] Cached Metrics`);
  }
}

async function worker() {
  try {
    await getSystemInfo();
  } catch (err) {
    console.log(`[Monitoring Workers] Failed`);
    console.error(err);
  }
}

export default function initMonitoring() {
  worker();
  return nodeCron.schedule("* * * * * *", worker);
}
