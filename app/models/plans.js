var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateOffset = (24*60*60*1000) * 2; //5 days
var myDate = new Date();
myDate.setTime(myDate.getTime() - dateOffset);

module.exports = mongoose.model('Plan', new Schema({
    user_id: String,
    stripe_customer_id: String,
    subscription_id: String,
    twilio_number_count: String,
    number_add_on: {type:String, default: 0},
    sms_count: String,
    plan_name: String,
    plan_status: String,
    days: String,
    start_time: {
        type: Date,
        //default: Date.now
        default: myDate 
    }
}));
