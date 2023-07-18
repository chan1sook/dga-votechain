import nodeCron from "node-cron";

import TopicModel from "~/src/models/topic";
import VoteAllowsModel from "~/src/models/voters-allow";
import NotificationModel from "~/src/models/notification";
import mongoose from "mongoose";
import { Types } from "mongoose";

async function checkFinishTopicsForNotifications() {
  console.log(
    `[Notification Workers] Begin Finished Topic Notifications Routine`
  );

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const notNotifyTopics = await TopicModel.find({
    voteExpiredAt: { $lt: new Date() },
    notifyFinished: false,
  });

  console.log(`[Notification Workers] Find ${notNotifyTopics.length} Topic(s)`);

  for (const topic of notNotifyTopics) {
    topic.notifyFinished = true;
  }

  const voteAllowsDocs = await VoteAllowsModel.find({
    topicid: { $in: notNotifyTopics.map((ele) => ele._id) },
  });

  const notifications: NotificationModelData[] = [];

  for (const noti of voteAllowsDocs) {
    const targetTopic = notNotifyTopics.find(
      (ele2) => ele2._id.toString() === noti.topicid.toString()
    );
    if (targetTopic) {
      notifications.push({
        userid: new Types.ObjectId(noti.userid),
        group: "topic",
        extra: {
          id: noti.topicid.toString(),
          name: targetTopic.name,
          status: "finished",
        },
        notifyAt: targetTopic.voteExpiredAt,
      });
    }
  }

  await Promise.all([
    TopicModel.bulkSave(notNotifyTopics),
    NotificationModel.insertMany(notifications),
  ]);

  await dbSession.commitTransaction();
  await dbSession.endSession();

  console.log(
    `[Notification Workers] Created ${notifications.length} Notification(s)`
  );
}

function worker() {
  try {
    checkFinishTopicsForNotifications();
  } catch (err) {
    console.log(`[Notification Workers] Failed`);
    console.error(err);
  }
}

export default function initNotificationWorkers() {
  worker();
  return nodeCron.schedule("* * * * *", worker);
}
