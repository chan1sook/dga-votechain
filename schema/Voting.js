const mongoose = require("mongoose");

const schema = {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter' },
    choice: Number,
}

module.exports.getSchema = () => {
    return schema;
}

module.exports.votingSchema = (app, mongoose) => {
    const _schema = schema;

    var VotingSchema = new mongoose.Schema(_schema);

    VotingSchema.set('autoIndex', (app.get('env') === 'development'));

    app.db.model('Voting', VotingSchema);
};