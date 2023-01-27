const mongoose = require("mongoose");

const schema = {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter' },
    choice: Number,
}

export const getSchema = () => {
    return schema;
}

export const votingSchema = (app, mongoose) => {
    const _schema = schema;

    var VotingSchema = new mongoose.Schema(_schema);

    VotingSchema.set('autoIndex', (app.get('env') === 'development'));

    app.db.model('Voting', VotingSchema);
};