import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { FilterQuery, Types } from "mongoose";
import TopicModel from "~/src/models/topic"
import { escapeRegExp } from "../formatter/regexp";

dayjs.extend(utc);
dayjs.extend(timezone);

export function getLastestGuestTopics(filter?: TopicFilterParams) {
  const query : FilterQuery<TopicModelData> = {
    status: "approved",
    publicVote: true,
    $or: [
      { voteExpiredAt: { $lte: new Date() }, },
      { anonymousVotes: true }
    ],
  };

  if(filter) {
    if(filter.type === "ticketId") {
      query._id = new Types.ObjectId(filter.ticketId);
    } else if(filter.type === "date") {
      const today = new Date();
      const startDate = dayjs(today).tz("Asia/Bangkok").year(filter.year).month(filter.month).date(1).hour(0).minute(0).second(0).millisecond(0);
      const endDate = startDate.month(filter.month + 1);
      
      query.voteStartAt = {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      }
    } else if(filter.type === "topicName") {
      const regex = RegExp(escapeRegExp(filter.keyword));
      query.name = regex;
    }

    if(filter.startid) {
      query._id = { $lt: new Types.ObjectId(filter.startid) }
    }
  }
  
  return TopicModel.find(query).limit(filter?.pagesize || 50).sort({_id: -1 });
};

export function getLastestVoterTopicsWithIds(ids: Types.ObjectId[], filter?: TopicFilterParams) {
  const query : FilterQuery<TopicModelData> = {
    status: "approved",
    $or: [
      { publicVote: true, voteExpiredAt: { $lte: new Date() }, },
      { _id: { $in: ids }, }
    ],
  };

  if(filter) {
    if(filter.type === "ticketId") {
      query._id = new Types.ObjectId(filter.ticketId);
    } else if(filter.type === "date") {
      const today = new Date();
      const startDate = dayjs(today).tz("Asia/Bangkok").year(filter.year).month(filter.month).date(1).hour(0).minute(0).second(0).millisecond(0);
      const endDate = startDate.month(filter.month + 1);
      
      query.voteStartAt = {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      }
    } else if(filter.type === "topicName") {
      const regex = RegExp(escapeRegExp(filter.keyword));
      query.name = regex;
    }

    if(filter.startid) {
      query._id = { $lt: new Types.ObjectId(filter.startid) }
    }
  }
  return TopicModel.find(query).limit(filter?.pagesize || 50).sort({_id: -1 });
};

export function getLastestAdminTopics(userid: Types.ObjectId, filter?: TopicFilterParams) {
  const query : FilterQuery<TopicModelData> = {
    status: "approved",
    $or: [
      { admin: userid },
      { coadmins: userid }
    ]
  };

  if(filter) {
    if(filter.type === "ticketId") {
      query._id = new Types.ObjectId(filter.ticketId);
    } else if(filter.type === "date") {
      const today = new Date();
      const startDate = dayjs(today).tz("Asia/Bangkok").year(filter.year).month(filter.month).date(1).hour(0).minute(0).second(0).millisecond(0);
      const endDate = startDate.month(filter.month + 1);
      
      query.voteStartAt = {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      }
    } else if(filter.type === "topicName") {
      const regex = RegExp(escapeRegExp(filter.keyword));
      query.name = regex;
    }

    if(filter.startid) {
      query._id = { $lt: new Types.ObjectId(filter.startid) }
    }
  }
  
  return TopicModel.find(query).limit(filter?.pagesize || 50).sort({_id: -1 });
}