import { model, Schema } from "mongoose";
import { legacyRoleToPermissions } from "../../src/utils/permissions";
import { getNtpTime } from "~~/server/ntp";

const schema = new Schema<OldUserData, OldUserModel>({
  userid: {
    type: String,
    required: true,
  },
  permissions: [String],
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
  },
});

schema.pre('save', function () {
  const today = getNtpTime();
  if (!this.createdAt) {
    this.createdAt = today;
  }
});

schema.static("ensureUserData", function ensureUserData(userid : string) {
  return this.findOneAndUpdate({
    userid,
  }, {
    $setOnInsert: {
      userid,
      permissions: legacyRoleToPermissions("voter"),
    },
  }, {
    new: true,
    upsert: true,
  });
});

export default model<OldUserData, OldUserModel>('user', schema);
