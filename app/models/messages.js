var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Messages', new Schema({
    event_id: String,
    twilio_number: String,
    number_status: String,
    message_type: String,
    user_phone: String,
    owner_phone: String,
    created_at: {
        type: Date,
        default: Date.now
    }
}));
