const schema = {
    name: String,
    nationid: {type: String, unique : true},
    imagePath: String,
    isValid: Boolean,
    created: {
        type: Date,
        default: Date.now
    }
}

module.exports.getSchema = () => {
    return schema;
}

module.exports.voterSchema = (app, mongoose) => {
    const _schema = schema;

    var VoterSchema = new mongoose.Schema(_schema);

    VoterSchema.set('autoIndex', (app.get('env') === 'development'));

    app.db.model('Voter', VoterSchema);
};