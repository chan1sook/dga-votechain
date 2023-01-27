import {
    voterSchema
} from './schema/Voter';
import {
    adminSchema
} from './schema/Admin';
import {
    topicSchema
} from './schema/Topic'
import {
    votingSchema
} from './schema/Voting'

export const models = (app, mongoose) => {
    voterSchema(app, mongoose);
    adminSchema(app, mongoose);
    topicSchema(app, mongoose);
    votingSchema(app, mongoose);
}