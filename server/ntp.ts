
import { NtpTimeSync } from "ntp-time-sync";


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

const SYNC_DELAY = 60 * 60 * 1000;

const timeSync = NtpTimeSync.getInstance({
  servers: getNtpServerFromPreset()
});

class NtpTime {
  lastSyncLocalTime = new Date();
  lastSyncNtpTime : Date | undefined;

  constructor() {
    console.log("Created");
    this.lastSyncLocalTime = new Date();
    this.lastSyncNtpTime = undefined;
  }

  #localDiff() {
    return this.lastSyncLocalTime ? (Date.now() - this.lastSyncLocalTime.getTime()) : 0;
  }

  async getNtpTime() {
    // console.log(this.lastSyncNtpTime,this.lastSyncLocalTime);
    
    if(!this.lastSyncNtpTime || this.#localDiff() >= SYNC_DELAY) {
      console.log("Need sync time");
      this.lastSyncNtpTime = await timeSync.now();
      this.lastSyncLocalTime = new Date();
    } else {
      console.log("Mixed Ntp and Local time", this.#localDiff());
    }
  
    return new Date(this.lastSyncNtpTime.getTime() + this.#localDiff());
  }

  async getNtpNow() {
    return (await this.getNtpTime()).getTime();
  }
}

const ntpTime = new NtpTime();

export function getNtpTime() {
  return ntpTime.getNtpTime();
}
export function getNtpNow() {
  return ntpTime.getNtpNow();
};