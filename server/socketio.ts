import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

import dayjs from "dayjs";
import { getNotifyData, setNotifyData } from "~/server/notify-storage";
import { blockchainHbEventEmitter, votedEventEmitter } from "~/server/event-emitter";
import { Types } from "mongoose";
import { getUnreadNotificationByUser } from "~/src/services/fetch/notification";
import { pauseTopic, resumeTopic } from "~/src/services/action/pause-topic";
import { checkPermissionNeeds } from "~/src/services/validations/permission";

export default async () => {
  const { SOCKETIO_ORIGIN_URL, REDIS_URI } = useRuntimeConfig();
  
  const io = new Server({
    cors: {
      origin: [SOCKETIO_ORIGIN_URL]
    }
  });
  votedEventEmitter.on("voted", async (votes : VoteResponseData[]) => {
    io.emit("voted", votes);
    const txChain : TxResponseData[] = votes.map((tx) => {
      return {
        voteId: `${tx._id}`,
        topicId: tx.topicid.toString(),
        userId: tx.userid ? tx.userid.toString() : "",
        choice: tx.choice === "" ? null : tx.choice,
        createdAt: dayjs(tx.createdAt).toString(),
        txhash: tx.tx,
        txStatus: Boolean(tx.tx) ? "valid" : "invalid",
      }
    });
    io.emit("tx", txChain);
  });

  blockchainHbEventEmitter.on("blockchainHb", (svData: BlockchainServerData) => {
    io.emit("blockchainHb", {
      _id: `${svData._id}`,
      host: svData.host,
      createdAt: dayjs(svData.createdAt).toString(),
      updatedAt: dayjs(svData.updatedAt).toString(),
      lastActiveAt: svData.lastActiveAt ? dayjs(svData.lastActiveAt).toString() : undefined,
    });
  });
  
  async function emitServerTime() {
    const time = new Date();
    io.emit("ntpTime", time.toISOString());
  }

  io.on("connection", (socket) => {
    console.log("[SocketIO] connected", socket.id);
    
    socket.on("syncTime", emitServerTime);
    
    socket.on("hasNotify", async ({ userid } : {userid: string}) => {
      let notifyData = await getNotifyData(userid);
      
      if(notifyData === undefined || Date.now() - notifyData.lastChecked >= 60000) {
        const unreadNotification = await getUnreadNotificationByUser(new Types.ObjectId(userid), 1);
        
        notifyData = {
          unread: unreadNotification.length > 0,
          lastChecked: Date.now(),
        };
        
        await setNotifyData(userid, notifyData);
      }
      
      socket.emit(`hasNotify/${userid}`, notifyData);
    });

    socket.on("pauseVote", async ({userid, topicid, cause} : {userid: string, topicid: string, cause: string}) => {
      try {
        const pauseAt = await pauseTopic(userid, topicid, cause);
        if(pauseAt) {        
          io.emit(`pauseVote/${topicid}`, {
            topicid: topicid,
            pauseAt: dayjs(pauseAt).toISOString(),
          });
        }
      } catch(err) {
        console.error(err);
      }
    })
  
    socket.on("resumeVote", async ({userid, topicid} : {userid: string, topicid: string}) => {
      try {
        const response = await resumeTopic(userid, topicid);
        if(response) {
          io.emit(`resumeVote/${topicid}`, {
            topicid: topicid,
            pauseAt: dayjs(response.pauseAt).toISOString(),
            resumeAt: dayjs(response.resumeAt).toISOString(),
            voteExpiredAt:  response.voteExpiredAt.toISOString(),
          });
        }
      } catch(err) {
        console.error(err);
      }
    })
  });

  const pubClient = createClient({ url: REDIS_URI });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    io.listen(3059);
  });
};