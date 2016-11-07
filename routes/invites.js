var Invite = require('../app/models/invites');
var Plan = require('../app/models/plans');
var User = require('../app/models/user');
var config = require('../config');
var crypto = require('crypto');
var Event = require('../app/models/events');
var stripe = require("stripe")("sk_test_bHQ01Hnro6LK3iNsx0r6JBs2");

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.username,
        pass: config.password
    }
});

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len); // return required number of characters
}

exports.invitedlist = function(req, res) {
    Invite.find({
            event_id: req.params.event_id
        },
        null, {
            sort: {
                "created_at": -1
            }
        },
        function(err, invites) {
            if (err)
                res.send(err)
            Event.find({
                    _id: req.params.event_id
                },
                function(err, events) {
                    if (err)
                        res.send(err)
                    Invite.findOne({
                            event_id: req.params.event_id,
                            event_creator: 'Yes'
                        },
                        function(err, invite_creator) {
                            if (err)
                                res.send(err)
                            res.json({
                                'logged_in_userid': req.decoded._doc._id,
                                'invite_creator': invite_creator,
                                'event': events,
                                'date_now': Date.now(),
                                'invites': invites
                            });
                        });
                });
        });
}

function add_plan(req, plan_type){

  var planobj = { 
    1: { twilio_number_count: 1, sms_count: 100, days: 7, melons: 0 }, 
    2: { twilio_number_count: 1, sms_count: 500, days: 30, melons: 0 }, 
    3: { twilio_number_count: 2, sms_count: 1000, days: 30, melons: 0 } 
  }
  User.findOne({ _id: req.decoded._doc._id }, function(err, user) {
     if (err) throw err;
   Plan.find({ user_id: req.decoded._doc._id }, function(err, existing_plan) {
     if (existing_plan.length) {
       console.log('plan already exists ----------------')
        Plan.update({
            user_id: req.decoded._doc._id,
        }, {
            $set: {
              twilio_number_count: planobj[plan_type]['twilio_number_count'], 
              sms_count: planobj[plan_type]['sms_count'], 
              plan_name: plan_type, 
              days: planobj[plan_type]['days'] 
            }
        },
        function(err, result) {
            if (err)
                throw err;
         return result;
        });
     } else {
       Plan.create({
            user_id: req.decoded._doc._id,
            twilio_number_count: planobj[plan_type]['twilio_number_count'], 
            sms_count: planobj[plan_type]['sms_count'], 
            plan_name: plan_type, 
            days: planobj[plan_type]['days'] 
       },
       function(err, plans) {
         if (err) throw err;
         console.log(plans)
         return plans;
//                            res.json({
 //                               'plans': plans
  //                          });
       });
      }
    });
  });
}

exports.addplan = function(req, res){
console.log('odododo')
var planobj = { 
    1: { twilio_number_count: 1, sms_count: 100, days: 7, melons: 0 }, 
    2: { twilio_number_count: 1, sms_count: 500, days: 30, melons: 0 }, 
    3: { twilio_number_count: 2, sms_count: 1000, days: 30, melons: 0 } 
}
console.log(req.body.plan_type)
    User.findOne({ _id: req.decoded._doc._id }, function(err, user) {
        if (err) throw err;
                        Plan.create({
                               user_id: req.decoded._doc._id,
                                twilio_number_count: planobj[req.body.plan_type]['twilio_number_count'], 
                                sms_count: planobj[req.body.plan_type]['sms_count'], 
                                plan_name: req.body.plan_type, 
                                days: planobj[req.body.plan_type]['days'] 
                            },
                            function(err, plans) {
                                if (err)
                                    throw err;
                            res.json({
                                'plans': plans
                            });
                            });
        });
}

exports.addphone = function(req, res) {

    Event.find({
            _id: req.params.event_id
        },
        function(err, events) {
            if (err)
                throw err;
            Invite.create({
                    event_id: req.params.event_id,
                    inviter: req.decoded._doc.username,
                    invited: req.body.text,
                    //twilio_number: '+14152149049',
                    twilio_number: events[0]["event_twilio_number"],
                    invited_email: '+1' + req.body.email,
                    invited_phone: req.body.phone,
                    invited_type: req.body.type,
                    invite_code: randomValueHex(8),
                    invite_status: "Added"
                },
                function(err, new_invite) {
                    console.log(events[0]["event_title"])
                        //     transporter.sendMail({
                        //           from: config.username,
                        //          to: req.body.email,
                        //         subject: 'You are invited to the event ' + events[0]["event_title"] + ' at ' + events[0]["event_start"],
                        //        html: 'You are invited to the event <a href="' + config.endpoint + '/event/' + req.params.event_id + '">' + events[0]["event_title"] + '</a>' + ' at ' + events[0]["event_start"],
                        //   });
                        //  transporter.close();
                    if (err)
                        throw err;
                    Invite.find({
                            event_id: req.params.event_id
                        },
                        null, {
                            sort: {
                                "created_at": -1
                            }
                        },
                        function(err, invites) {
                            if (err)
                                res.send(err)
                            res.json({
                                'invites': invites
                            });
                        });
                }); //d8d88d
        });
}


exports.addinvite = function(req, res) {

    Event.find({
            _id: req.params.event_id
        },
        function(err, events) {
            if (err)
                throw err;
            Invite.create({
                    event_id: req.params.event_id,
                    inviter: req.decoded._doc.username,
                    invited: req.body.text,
                    invited_email: req.body.email,
                    invited_phone: req.body.phone,
                    invited_type: req.body.type,
                    invite_code: randomValueHex(8),
                    invite_status: "Sent"
                },
                function(err, new_invite) {
                    console.log(events[0]["event_title"])
                    transporter.sendMail({
                        from: config.username,
                        to: req.body.email,
                        subject: 'You are invited to the event ' + events[0]["event_title"] + ' at ' + events[0]["event_start"],
                        html: 'You are invited to the event <a href="' + config.endpoint + '/event/' + req.params.event_id + '">' + events[0]["event_title"] + '</a>' + ' at ' + events[0]["event_start"],
                    });
                    transporter.close();
                    if (err)
                        throw err;
                    Invite.find({
                            event_id: req.params.event_id
                        },
                        null, {
                            sort: {
                                "created_at": -1
                            }
                        },
                        function(err, invites) {
                            if (err)
                                res.send(err)
                            res.json({
                                'invites': invites
                            });
                        });
                }); //d8d88d
        });
}

exports.deleteinvite = function(req, res) {
    Invite.remove({
        _id: req.params.invite_id
    }, function(err, invites) {
        if (err) res.send(err);
        res.json(invites);
    });
}

exports.subscribe = function(req, res) {

        console.log("weeeeeee")
	var stripeToken = req.body.stripeToken;
	var totalcharge = req.body.totalcharge;
	var plan = req.body.plan;
               console.log(plan)

	var charge = stripe.customers.create({
		source: stripeToken,
		plan: "sarah",
		email: "payinguser3@example.com"
	}, function(err, customer) {
		if (err && err.type === 'StripeCardError') {
               console.log("err")
			// The card has been declined
		} else {
               console.log(customer)
               add_plan(req, plan, function(data) {
             //   res.json({
              //      success: true,
              //  });
                // res.json(data);
               });
               res.json({
                                'invites': customer
                            });
			//Render a thank you page called "Charge"
		//	res.render('charge', { title: 'Charge' });
		}
	});

}

exports.join_event = function(req, res) {
    console.log('made it');

    Event.find({
            _id: req.params.event_id
        },
        function(err, events) {
            if (err)
                throw err;
            Invite.create({
                    event_id: req.params.event_id,
                    //inviter: req.decoded._doc.username,
                    //  invited: req.body.text,
                    //  invited_email: req.body.email,
                    //   invited_phone: req.body.phone,
                    //   invited_type: req.body.type,
                    invite_code: randomValueHex(8),
                    invite_status: "Yes"
                },
                function(err, new_invite) {

                    console.log(events[0]["event_title"])
                        /*
                                            transporter.sendMail({
                                                from: config.username,
                                                to: req.body.email,
                                                subject: 'You are invited to the event ' + events[0]["event_title"] + ' at ' + events[0]["event_start"],
                                                html: 'You are invited to the event <a href="' + config.endpoint + '/invite/' + new_invite.invite_code + '">' + events[0]["event_title"] + '</a>' + ' at ' + events[0]["event_start"],
                                            });
                                            transporter.close();
                        */
                    if (err)
                        throw err;
                    Invite.find({
                            event_id: req.params.event_id
                        },
                        null, {
                            sort: {
                                "created_at": -1
                            }
                        },
                        function(err, invites) {
                            if (err)
                                res.send(err)
                            res.json({
                                'invites': invites
                            });
                        });
                }); //d8d88d
        });
}
