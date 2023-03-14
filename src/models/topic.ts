import { FilterQuery, model, Schema, Types } from "mongoose";

const schema = new Schema<TopicData, TopicModel>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
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
  updatedBy: {
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
}, { timestamps: true });


schema.static("getLastestPendingTopics", function getLastestPendingTopics(pagesize?: number, startid?: string) {
  const query : FilterQuery<TopicData> = {
    status: "pending",
    voteExpiredAt: { $gte: new Date() },
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestAvalaibleTopics", function getLastestAvalaibleTopics(pagesize?: number, startid?: string) {
  const query : FilterQuery<TopicData> = {
    status: "approved",
    voteExpiredAt: { $gte: new Date() },
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestWaitingTopics", function getLastestWaitingTopics(pagesize?: number, startid?: string) {
  const query : FilterQuery<TopicData> = {
    status: "approved",
    voteStartAt: { $gte: new Date() },
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestActiveTopics", function getLastestActiveTopics(pagesize?: number, startid?: string, excludedIds?: Array<Types.ObjectId>) {
  const query : FilterQuery<TopicData> = {
    status: "approved",
    voteStartAt: { $lt: new Date() },
    voteExpiredAt: { $gte: new Date() },
  };

  if(Array.isArray(excludedIds)) {
    query._id = { $nin: excludedIds };
  }

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getLastestFinishedTopics", function getLastestFinishedTopics(pagesize?: number, startid?: string) {
  const query : FilterQuery<TopicData> = {
    status: "approved",
    voteExpiredAt: { $lt: new Date() },
  };

  if(startid) {
    query._id = { $lt: new Types.ObjectId(startid) }
  }
  
  return this.find(query).limit(pagesize || 50).sort({_id: -1 });
});

schema.static("getSelectedTopics", function getSelectedTopics(filterIds: Array<Types.ObjectId>) {
  const query : FilterQuery<TopicData> = {
    _id: { $in: filterIds }
  };
  
  return this.find(query).sort({_id: -1 });
});

export default model<TopicData, TopicModel>('topic', schema);