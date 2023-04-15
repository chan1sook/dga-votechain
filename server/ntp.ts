
import { NtpTimeSync } from "ntp-time-sync";
import cron from "node-cron";

function getNtpServerFromPreset(preset = 'demo') {
  switch(preset) {
    case "nimt":
      return [
        "time1.nimt.or.th", "time2.nimt.or.th", "time3.nimt.or.th", "time4.nimt.or.th", "time5.nimt.or.th",
      ]
    case "demo":
    default:
      return [
        "0.pool.ntp.org", "1.pool.ntp.org", "2.pool.ntp.org", "3.pool.ntp.org"
      ]
  }
}

function getSyncDelay(preset = 'demo') {
  switch(preset) {
    case "nimt":
    case "demo":
    default:
      return 12 * 60 * 60 * 1000;
  }
}

const PRESET = "nimt";

const timeSync = NtpTimeSync.getInstance({
  servers: getNtpServerFromPreset(PRESET)
});

class NtpTime {
  lastSyncLocalTime = new Date();
  lastSyncNtpTime : Date | undefined;

  constructor() {
    console.log("Created");
    this.lastSyncLocalTime = new Date();
    this.lastSyncNtpTime = undefined;
  }

  localDiff() {
    return Date.now() - this.lastSyncLocalTime.getTime();
  }

  async syncTime() {
    console.log("Sync time");
    this.lastSyncNtpTime = await timeSync.now();
    this.lastSyncLocalTime = new Date();
    console.log("New time", this.lastSyncNtpTime);
  }

  getNtpTime() {
    if(!this.lastSyncNtpTime) {
      return new Date(this.lastSyncLocalTime.getTime() + this.localDiff());
    }
  
    return new Date(this.lastSyncNtpTime.getTime() + this.localDiff());
  }

  getNtpNow() {
    return this.getNtpTime().getTime();
  }
}

const ntpTime = new NtpTime();

export function getNtpTime() {
  return ntpTime.getNtpTime();
}
export function getNtpNow() {
  return ntpTime.getNtpNow();
};

export async function beginNtpTime() {
  await ntpTime.syncTime();
  cron.schedule("* * * * *", async () => {
    if(ntpTime.localDiff() >= getSyncDelay(PRESET)) {
      await ntpTime.syncTime();
    }
  })
}