import { model, Schema } from "mongoose";
import { getDefaultTopMenus } from "../services/form/preference";

const schema = new Schema<UserModelData>(
  {
    permissions: [String],
    authSources: [
      new Schema({
        authSource: {
          type: String,
          required: true,
        },
        digitalIdUserId: {
          type: String,
        },
        thaIDUserId: {
          type: String,
        },
      }),
    ],
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
    },
    isGovOfficer: {
      type: Boolean,
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
    cidHashed: {
      type: String,
    },
    preferences: new Schema({
      topMenu: {
        type: [String],
        default: getDefaultTopMenus,
      },
    }),
    removeAt: {
      type: Date,
    },
    removed: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({
  firstName: 1,
  lastName: 1,
  authSources: 1,
  email: 1,
  cidHashed: 1,
  removeAt: 1,
});

export default model("dga-user", schema);
