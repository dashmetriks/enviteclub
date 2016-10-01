var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    username: String,
    displayname: String,
    phone: String,
    password: String,
    admin: Boolean
}));
