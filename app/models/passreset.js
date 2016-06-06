var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Passwordreset', new Schema({
    reset_email: String,
    reset_code: String,
    reset_status: String,
    created_at: {
        type: Date,
        default: Date.now
    }
}));
