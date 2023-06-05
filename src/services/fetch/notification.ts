import { FilterQuery, Types } from "mongoose";
import { getRequestPermissionsDataById } from "./permission";
import { getVoterAllowByUserIdNotification } from "./vote-allow";
import ReadNotificationModel from "~/src/models/read-notification";

function getReadNotificationsByIds(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const query : FilterQuery<RequestPermissionsModelData> = {
    userid: userid,
  };
  
  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }

  return ReadNotificationModel.find(query).sort({ _id: -1 }).limit(pagesize || 50);
}

export async function getNotificationByUser(userid: Types.ObjectId, pagesize?: number, startid?: string) {
  const [requestPermissions, voteAllows] = await Promise.all([
    getRequestPermissionsDataById(userid, pagesize, startid),
    getVoterAllowByUserIdNotification(userid, pagesize, startid),
    // getVoterAllowByUserIdNotification(userid, pagesize, startid).populate("topicid"),
  ]);

  console.log()
  const notifications : NotificationModelData[] = [];
  for(const rq of requestPermissions) {
    notifications.push({
      userid: userid,
      group: "request-permission",
      extra: {
        id: rq._id.toString(),
        status: rq.status,
      },
    })
  } 

  for(const vote of voteAllows) {
    notifications.push({
      userid: userid,
      group: "request-permission",
      extra: {
        id: vote._id.toString(),
        name: (vote.topicid as TopicModelDataWithId).name,
        status: "pending",
      },
    })
  } 

  return notifications;
}