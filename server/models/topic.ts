import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { FilterQuery, model, Schema, Types } from "mongoose";
import { escapeRegExp } from "../../src/utils/utils";

dayjs.extend(utc);
dayjs.extend(timezone);

const schema = new Schema<TopicData, TopicModel>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  multipleVotes: {
    type: Boolean,
    default: false,
  },
  choices: {
    type: new Schema<ChoicesData>({
      choices: {
        type: [new Schema({
          name: {
            type: String,
            required: true,
          },
          image: {
            type: String,
          },
        })],
        required: true,
      },
      customable: {
        type: Boolean,
        required: true,
      },
    }),
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "dga-user"
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "dga-user"
  },
  durationMode: {
    type: String,
  },
  voteStartAt: {
    type: Date,
    required: true,
  },
  voteExpiredAt: {
    type: Date,
    required: true,
  },
  publicVote: {
    type: Boolean,
    required: true,
  },
  showScores: {
    type: Boolean,
    required: true,
  },
  showVotersChoicesPublic: {
    type: Boolean,
    required: true,
  },
  notifyVoter: {
    type: Boolean,
    default: true,
  },
  recoredToBlockchain: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

schema.statics.getLastestFinishedPublicVoteTopics = function getLastestAdminTopics(filter?: TopicFilterParams) {
  const query : FilterQuery<TopicData> = {
    status: "approved",
    publicVote: true,
    voteExpiredAt: { $lte: new Date() },
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
  
  return this.find(query).limit(filter?.pagesize || 50).sort({_id: -1 }).populate("createdBy updatedBy");
};

schema.statics.getLastestVoterTopicsWithIds = function getLastestAdminTopics(ids: Array<Types.ObjectId>, filter?: TopicFilterParams) {
  const query : FilterQuery<TopicData> = {
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
  return this.find(query).limit(filter?.pagesize || 50).sort({_id: -1 }).populate("createdBy updatedBy");
};

schema.statics.getLastestAdminTopics = function(filter?: TopicFilterParams) {
  const query : FilterQuery<TopicData> = {
    status: "approved",
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
  
  return this.find(query).limit(filter?.pagesize || 50).sort({_id: -1 }).populate("createdBy updatedBy");
}
export default model<TopicData, TopicModel>('topic', schema);