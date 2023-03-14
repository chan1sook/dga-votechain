import { model, Schema } from "mongoose";
import { legacyRoleToPermissions } from "../utils/permissions";

const schema = new Schema<UserDatabaseData, UserModel>({
  userid: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
  permissions: [String],
}, { timestamps: true });

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

export default model<UserDatabaseData, UserModel>('user', schema);
