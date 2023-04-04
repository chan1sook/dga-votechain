import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { FilterQuery, model, Schema, Types } from "mongoose";
import { escapeRegExp, isThaiCitizenId } from "../../src/utils/utils";
import { getNtpTime } from "~~/server/ntp";

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
    type: String,
    required: true,
  },
  createdByName: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
  },
  updatedByName: {
    type: String,
    required: true,
  },
  voteStartAt: {
    type: Date,
    required: true,
  },
  voteExpiredAt: {
    type: Date,
    required: true,
  },
  pauseDuration: {
    type: Number,
    default: 0,
  },
  voterAllows: [new Schema({
    citizenId: {
      type: String,
      required: [true, 'Is Must Valid Thai CitizenId'],
      validate: {
        validator: isThaiCitizenId,
      },
    },
    totalVotes: {
      type: Number,
      required: true,
    },
    remainVotes: {
      type: Number,
      required: true,
    },
  })],
  publicVote: {
    type: Boolean,
    required: true,
  },
  notifyVoter: {
    type: Boolean,
    required: true,
  },
  votePauseAt: {
    type: Date,
  },
  showVotersScore: {
    type: Boolean,
    required: true,
  },
  showVotersChoicesPublic: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});

schema.pre('save', async function () {
  const today = await getNtpTime();
  if (!this.createdAt) {
    this.createdAt = today;
  }
  this.createdAt = today;
});

schema.static("getLastestAvailableTopics", async function getLastestAvailableTopics(
  filter?: TopicFilterParams, includePrivate?: boolean
) {
  const query : FilterQuery<TopicData> = {};
  
  if(filter) {
    if(filter.type === "ticketId") {
      query._id = new Types.ObjectId(filter.ticketId);
    } else if(filter.type === "date") {
      const today = await getNtpTime();
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

    if(!includePrivate) {
      query.publicVote = true;
    }
  }
  
  return await this.find(query).limit(filter?.pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestActiveTopics", async function getLastestActiveTopics(
  userData: UserData, filter?: TopicFilterParams
) {
  const query : FilterQuery<TopicData> = {
    status: "approved",
    "voterAllows.citizenId" : userData.digitalIdUserInfo.citizen_id,
  };

  if(filter) {
    if(filter.type === "ticketId") {
      query._id = new Types.ObjectId(filter.ticketId);
    } else if(filter.type === "date") {
      const today = await getNtpTime();
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
  
  return await this.find(query).limit(filter?.pagesize || 50).sort({_id: -1 });
});

export default model<TopicData, TopicModel>('topic', schema);