var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    username: String,
    displayname: String,
    phone: String,
    confirm_phone_code: String,
    phone_confirmed: String,
    password: String,
    admin: Boolean
}));
