import mongoose, { Types } from "mongoose";
import UserModel from "~/src/models/user";
import TopicModel from "~/src/models/topic";
import TopicCtrlPauseModel from "~/src/models/topic-ctrl-pause";
import VoteAllowsModel from "~/src/models/voters-allow"
import NotificationModel from "~/src/models/notification"
import { checkPermissionNeeds } from "../validations/permission";
import { isTopicPause } from "../fetch/topic-ctrl-pause";
import dayjs from "dayjs";

export async function pauseTopic(userid: string, topicid: string, cause: string) { 
  const [userData, targetTopic] = await Promise.all([
    UserModel.findById(userid),
    TopicModel.findById(topicid)
  ]);
  if(!userData || !targetTopic || !checkPermissionNeeds(userData.permissions, "change-topic")) {
    return;
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const topicPauseFlag = await isTopicPause(targetTopic._id);
  const pasueAt = new Date();

  if(!topicPauseFlag) {
    const topicCtrlPauseDoc = new TopicCtrlPauseModel({
      topicid: targetTopic._id,
      pauseAt: pasueAt,
      cause: cause,
    });
    
    const voteAllowsDocs = await VoteAllowsModel.find({
      topicid: targetTopic._id
    })

    const notifications : NotificationModelDataWithId[] = voteAllowsDocs.map((ele) => {
      return {
        userid: new Types.ObjectId(ele.userid),
        group: "topic",
        extra: {
          id: ele.topicid.toString(),
          name: targetTopic.name,
          status: "pause",
          cause: cause,
        },
        notifyAt: pasueAt,
      }
    });

    await Promise.all([
      NotificationModel.insertMany(notifications),
      topicCtrlPauseDoc.save()
    ])

    await dbSession.commitTransaction();
    await dbSession.endSession();

    return pasueAt;
  }

  await dbSession.endSession();
}

export async function resumeTopic(userid: string, topicid: string) { 
  const [userData, targetTopic] = await Promise.all([
    UserModel.findById(userid),
    TopicModel.findById(topicid)
  ]);
  if(!userData || !targetTopic || !checkPermissionNeeds(userData.permissions, "change-topic")) {
    return;
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const resumeAt = new Date();

  let lastestPauseData = await TopicCtrlPauseModel.findOne({
    topicid: targetTopic._id,
    resumeAt: { $exists: false }
  })
  if(lastestPauseData) {
    lastestPauseData.resumeAt = resumeAt;
    targetTopic.voteExpiredAt = dayjs(resumeAt).add(dayjs(targetTopic.voteExpiredAt).diff(lastestPauseData.pauseAt)).toDate()
    
    const voteAllowsDocs = await VoteAllowsModel.find({
      topicid: targetTopic._id
    })

    const notifications : NotificationModelDataWithId[] = voteAllowsDocs.map((ele) => {
      return {
        userid: new Types.ObjectId(ele.userid),
        group: "topic",
        extra: {
          id: ele.topicid.toString(),
          name: targetTopic.name,
          status: "resume",
        },
        notifyAt: resumeAt,
      }
    });

    await Promise.all([
      NotificationModel.insertMany(notifications),
      lastestPauseData.save(),
      targetTopic.save(),
    ])

    await dbSession.commitTransaction();
    await dbSession.endSession();

    return {
      pauseAt: lastestPauseData.pauseAt,
      resumeAt: resumeAt,
      voteExpiredAt: targetTopic.voteExpiredAt,
    };
  }
  
  await dbSession.endSession();
}