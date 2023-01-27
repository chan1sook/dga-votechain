const dayjs = require("dayjs");

const schema = {
    name: String,
    choices: [String],
    start: {
        type: Date,
        default: Date.now,
    },
    expired: {
        type: Date,
        default() {
            return dayjs().add(1, "month").valueOf()
        }
    }
}

export const getSchema = () => {
    return schema;
}

export const topicSchema = (app, mongoose) => {
    const _schema = schema;

    var TopicSchema = new mongoose.Schema(_schema);

    TopicSchema.set('autoIndex', (app.get('env') === 'development'));

    app.db.model('Topic', TopicSchema);
};