import dayjs from "dayjs";
import { io } from "socket.io-client";

const { SOCKETIO_URL, public: { SYNCTIME_THERSOLD } } = useRuntimeConfig();
const syncTime = Math.floor(SYNCTIME_THERSOLD / 2);
const socket = io(SOCKETIO_URL);

let syncTimeID : NodeJS.Timer | undefined;

socket.on("connect", () => {
  console.log("SocketIO connected");

  clearInterval(syncTimeID);
  syncTimeID = setInterval(() => {
    socket.volatile.emit("syncTime");
  }, syncTime);
  
  socket.volatile.emit("syncTime");
});

socket.on("disconnect", () => {
  clearInterval(syncTimeID);
})

socket.on("ntpTime", (_time : DateString) => {
  useSyncTimeData().value = {
    synced: true,
    lastestSyncLocal: new Date(),
    time: dayjs(_time).toDate(),
  }
});

export const useSocketIO = () => {
  return socket;
}