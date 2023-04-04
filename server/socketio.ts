import { Server } from "socket.io";

import { getSessionData } from "~~/server/session-handler";

import TopicModel from "~~/server/models/topic";
import NotificationModel from "~~/server/models/notification";
import dayjs from "dayjs";
import { checkPermissionNeeds } from "../src/utils/permissions";
import { getNtpTime } from "~~/server/ntp";

export default () => {
  const { public: { SOCKETIO_URL }, SOCKETIO_ORIGIN_URL } = useRuntimeConfig();
  
  const io = new Server({
    cors: {
      origin: [SOCKETIO_ORIGIN_URL]
    }
  });
  
  async function emitServerTime() {
    const time = await getNtpTime()
    console.log("IO", time);
    io.emit("ntpTime", time.toISOString());
  }

  io.on("connection", (socket) => {
    console.log("[SocketIO] connected", socket.id);
    
    socket.on("syncTime", emitServerTime);
    
    socket.on("hasNotify", async ({sid} : {sid: string}) => {
      const userData = await getSessionData(sid);
      if(!userData || !checkPermissionNeeds(userData.permissions, "access-notifications")) {
        return;
      }

      const unreadNotifications = await NotificationModel.getLastestUnreadNotifications(userData.digitalIdUserInfo.citizen_id, 1);
      const hasUnreadNotifications = unreadNotifications.length > 0;
      socket.emit(`hasNotify/${sid}`, hasUnreadNotifications);
    });

    socket.on("pauseVote", async ({sid, topicId} : {sid: string, topicId?: string}) => {
      const userData = await getSessionData(sid);
      if(!userData || !checkPermissionNeeds(userData.permissions, "change-topic")) {
        return;
      }
  
      const targetTopic = await TopicModel.findById(topicId);
      if(!targetTopic) {
        return;
      }
  
      targetTopic.votePauseAt = await getNtpTime();
      await targetTopic.save();
      socket.emit(`pauseVote/${topicId}`, targetTopic.votePauseAt.toISOString());
    })
  
    socket.on("resumeVote", async ({sid, topicId} : {sid: string, topicId?: string}) => {
      const userData = await getSessionData(sid);
      if(!userData || !checkPermissionNeeds(userData.permissions, "change-topic")) {
        return;
      }
  
      
      const targetTopic = await TopicModel.findById(topicId);
      if(!targetTopic || !targetTopic.votePauseAt) {
        return;
      }
      
      const today = await getNtpTime();
      const pauseDuration = dayjs(today).diff(targetTopic.votePauseAt);
      const remainDuration = dayjs(targetTopic.voteExpiredAt).diff(targetTopic.votePauseAt);
      targetTopic.voteExpiredAt = dayjs(today).add(remainDuration).toDate();
      targetTopic.pauseDuration += pauseDuration;
      await targetTopic.save();
      socket.emit(`resumeVote/${topicId}`, {
        voteExpiredAt: targetTopic.voteExpiredAt.toISOString(),
        pauseDuration: targetTopic.pauseDuration,
      });
    })
  });
  
  const port = parseInt(new URL(SOCKETIO_URL).port, 10);
  io.listen(port);
};