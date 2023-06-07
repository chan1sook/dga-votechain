import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

import UserModel from "~/src/models/user";
import TopicModel from "~/src/models/topic";
import TopicCtrlPauseModel from "~/src/models/topic-ctrl-pause";
import dayjs from "dayjs";
import { getNotifyData, setNotifyData } from "~/server/notify-storage";
import { blockchainHbEventEmitter, votedEventEmitter } from "~/server/event-emitter";
import mongoose, { Types } from "mongoose";
import { isTopicPause } from "~/src/services/fetch/topic-ctrl-pause";
import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { getUnreadNotificationByUser } from "~/src/services/fetch/notification";

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

    socket.on("pauseVote", async ({userid, topicId, cause} : {userid: string, topicId?: string, cause: string}) => {
      const [userData, targetTopic] = await Promise.all([
        UserModel.findById(userid),
        TopicModel.findById(topicId)
      ]);
      if(!userData || !targetTopic || !checkPermissionNeeds(userData.permissions, "change-topic")) {
        return;
      }
      
      const topicPauseFlag = await isTopicPause(targetTopic._id);
      if(!topicPauseFlag) {
        const topicCtrlPauseDoc = new TopicCtrlPauseModel({
          topicid: targetTopic._id,
          pauseAt: new Date(),
          cause: cause,
        });
        
        await topicCtrlPauseDoc.save()
        
        io.emit(`pauseVote/${topicId}`, {
          topicid: topicCtrlPauseDoc.topicid,
          pauseAt: dayjs(topicCtrlPauseDoc.pauseAt).toISOString(),
        });
      }
    })
  
    socket.on("resumeVote", async ({userid, topicId} : {userid: string, topicId?: string}) => {
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      const [userData, targetTopic] = await Promise.all([
        UserModel.findById(userid),
        TopicModel.findById(topicId)
      ]);
      if(!userData || !targetTopic || !checkPermissionNeeds(userData.permissions, "change-topic")) {
        return;
      }
      
      let lastestPauseData = await TopicCtrlPauseModel.findOne({
        topicid: targetTopic._id,
        resumeAt: { $exists: false }
      })
      if(lastestPauseData) {
        lastestPauseData.resumeAt = new Date();
        targetTopic.voteExpiredAt = dayjs(new Date()).add(dayjs(targetTopic.voteExpiredAt).diff(lastestPauseData.pauseAt)).toDate()
        
        await Promise.all([
          lastestPauseData.save(),
          targetTopic.save()
        ]);

        await dbSession.commitTransaction();
        await dbSession.endSession();

        io.emit(`resumeVote/${topicId}`, {
          topicid: lastestPauseData.topicid,
          pauseAt: dayjs(lastestPauseData.pauseAt).toISOString(),
          resumeAt: dayjs(lastestPauseData.resumeAt).toISOString(),
          voteExpiredAt:  targetTopic.voteExpiredAt.toISOString(),
        });
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