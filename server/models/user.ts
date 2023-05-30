import { model, Schema } from "mongoose";

const schema = new Schema<UserData>({
  permissions: [String],
  authSources: [new Schema({
    authSource: {
      type: String,
      required: true,
    },
    digitalIdUserId: {
      type: String
    },
    firebaseUid:  {
      type: String
    },
  })],
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  ministry: {
    type: String,
  },
  department: {
    type: String,
  },
  division: {
    type: String,
  },
  hashedCitizenId: {
    type: String,
  },
  citizenId: {
    type: String,
  },
  group: [String],
  preferences: new Schema({
    topMenus: [String],
  })
}, {
  timestamps: true,
  query: {
    byDigitalIdUserId(digitalIdUserId: DigitalIDUserId) {
      return this.where("authSources")
        .elemMatch("authSource").equals("digitalId")
        .elemMatch("digitalIdUserId").equals(digitalIdUserId)
    }
  }
});

export default model('dga-user', schema);
