var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Event', new Schema({
    event_title: String,
    event_creator: String,
    event_image: {
        type: String,
        default: "0"
    },
    event_creator_displayname: String,
    event_start: String,
    event_time: String,
    event_location: String,
    event_twilio_number: String,
    event_reply_setting: String,
    event_creator_phone: String,
    event_end: String,
    created_at: {
        type: Date,
        default: Date.now
    }
}));
