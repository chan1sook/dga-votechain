import dayjs from "dayjs";
import { Socket, io } from "socket.io-client";

let socket: Socket | undefined;

export const useSocketIO = () => {
  if(socket) {
    return socket;
  }
  const { SOCKETIO_URL, SYNCTIME_THERSOLD } = useRuntimeConfig();
  
  const syncTime = Math.floor(SYNCTIME_THERSOLD / 2);

  const sioUrl = new URL(SOCKETIO_URL);
  let sioPath = sioUrl.pathname;
  if(!sioPath.endsWith("/")) {
    sioPath += "/";
  }
  sioPath += "socket.io";
  socket = io(sioUrl.host, { path: sioPath});

  let syncTimeID : NodeJS.Timer | undefined;

  socket.on("connect", () => {
    console.log("SocketIO connected");
  
    clearInterval(syncTimeID);
    syncTimeID = setInterval(() => {
      socket?.volatile.emit("syncTime");
    }, syncTime);
    
    socket?.volatile.emit("syncTime");
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

  return socket;
}