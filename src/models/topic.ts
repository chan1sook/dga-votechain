import { model, Schema } from "mongoose";

const schema = new Schema<TopicModelData>({
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
    type: new Schema<ChoicesInfo>({
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
  admin : {
    type: Schema.Types.ObjectId,
    ref: "dga-user"
  },
  coadmins: [{
    type: Schema.Types.ObjectId,
    ref: "dga-user"
  },],
  durationMode: {
    type: String,
    default: "startDuration",
  },
  defaultVotes: {
    type: Number,
    default: 1
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
  notifyVoter: {
    type: Boolean,
    default: true,
  },
  recoredToBlockchain: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default model<TopicModelData>('topic', schema);