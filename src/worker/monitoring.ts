import nodeCron from "node-cron";
import systeminformation from "systeminformation";
import ServerMetricsModel from "~/src/models/server-metrics";

const isProduction =
  !process.env.IS_DEV && process.env.NODE_ENV === "production";

async function getSystemInfo() {
  const [mem, currentLoad, dockerAll, fsSize] = await Promise.all([
    systeminformation.mem(),
    systeminformation.currentLoad(),
    systeminformation.dockerAll(),
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
  };

  await new ServerMetricsModel(metrics).save();
}

function worker() {
  try {
    getSystemInfo();
  } catch (err) {
    console.log(`[Monitoring Workers] Failed`);
    console.error(err);
  }
}

export default function initMonitoring() {
  worker();
  return nodeCron.schedule("*/10 * * * * *", worker);
}
