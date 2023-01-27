const { voterSchema } = require('./schema/Voter');
const { adminSchema } = require('./schema/Admin');
const { topicSchema } = require('./schema/Topic');
const { votingSchema } = require('./schema/Voting');

module.exports.models = (app, mongoose) => {
  voterSchema(app, mongoose);
  adminSchema(app, mongoose);
  topicSchema(app, mongoose);
  votingSchema(app, mongoose);
}