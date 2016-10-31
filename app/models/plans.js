var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateOffset = (24*60*60*1000) * 5; //5 days
var myDate = new Date();
myDate.setTime(myDate.getTime() - dateOffset);

module.exports = mongoose.model('Plan', new Schema({
    user_id: String,
    twilio_number_count: String,
    sms_count: String,
    days: String,
    start_time: {
        type: Date,
        //default: Date.now
        default: myDate 
    }
}));
