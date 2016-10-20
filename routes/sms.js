var Invite = require('../app/models/invites');
var User = require('../app/models/user');
var Baby = require('babyparse');
var Event = require('../app/models/events');
var Comments = require('../app/models/comments');
var crypto = require('crypto');
var config = require('../config');
var client = require('twilio')(config.twilio_sid, config.twilio_token);

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len); // return required number of characters
}

exports.sendsms_invite = function(req, res) {

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
                    console.log("dksakdfksafkads")
                    client.sendMessage({

                        to: '+1' + req.body.phone, // Any number Twilio can deliver to
                        from: '+14152149049', // A number you bought from Twilio and can use for outbound communication
                        //body: req.body.sms_type // body of the SMS message
                        body: req.body.message

                    }, function(err, responseData) { //this function is executed when a response is received from Twilio

                        console.log(err)
                        if (!err) { // "err" is an error received during the request, if any

                        }
                    });
                    if (err)
                        throw err;
                    Invite.find({
                            invite_code: new_invite.invite_code
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

exports.sendsms = function(req, res) {

    User.findOne({
        _id: req.decoded._doc._id
    }, function(err, user) {
        if (err) throw err;
        Comments.create({
                event_id: req.params.event_id,
                displayname: user.displayname,
                text: req.body.message
            },
            function(err, result) {
                if (err)
                    throw err;
            });

        Invite.find({
                event_id: req.params.event_id,
                invite_status: "Sent"
            },
            null, {
                sort: {
                    "created_at": -1
                }
            },
            function(err, invites) {
                if (err) res.send(err)
                console.log(invites);
                //  
                invites.forEach(function(doc) {
                    //console.log(doc.name + " is a " + doc.category_code + " company.");
                    if (doc.invited_email != "jdjdj@222.com") {
                        console.log(doc.invited_phone)
                        console.log(user.displayname)
                        client.sendMessage({

                            to: '+1' + doc.invited_phone, // Any number Twilio can deliver to
                            //from: '+14152149049', // A number you bought from Twilio and can use for outbound communication
                            //from: '+15102294542', // A number you bought from Twilio and can use for outbound communication
                            from: doc.twilio_number,
                            //body: req.body.sms_type // body of the SMS message
                            body: user.displayname + ' says: ' + req.body.message

                        }, function(err, responseData) { //this function is executed when a response is received from Twilio
                            res.end('Done')
                            console.log(err)
                            if (!err) { // "err" is an error received during the request, if any

                            }
                        });
                    }
                    //    res.json({ 'invites': invites });
                });
            });
    });
}

exports.csv_upload = function(req, res) {
    console.log(req.files)
    var file = req.files.file;
    fs = require('fs')
    fs.readFile(file.path, function(err, data) {
        if (err) throw err;
        file_name_loc = './uploads/test1.csv';
        fs.writeFile(file_name_loc, data, function(err) {
            if (err) throw err;
            console.log('It\'s saved!');
            parsed = Baby.parseFiles(file_name_loc);
            rows = parsed.data;
            console.log(rows)
            res.json(rows);
        });
    });
}

exports.sendcsvsms = function(req, res) {

    console.log(req.body.phone_number)
    client.sendMessage({
        to: req.body.phone_number, // Any number Twilio can deliver to
        from: '+14152149049', // A number you bought from Twilio and can use for outbound commu
        body: req.body.text

    }, function(err, responseData) { //this function is executed when a response is received from Twilio
        res.end('Done')

        console.log(responseData)
        console.log(err)
        if (!err) { // "err" is an error received during the request, if any

        }
    });
}


exports.smsdata = function(req, res) {

    console.log(req.query.To);
    console.log("asdfasdfadsf");
    // console.log(req.query.To.replace('+1', ''));
    //   console.log(req.query.From);
    var FromNumber = req.query.From.replace('+1', '')

    Invite.find({
            twilio_number: req.query.To,
            invite_status: "Sent"
        },
        null, {
            sort: {
                "created_at": -1
            }
        },
        function(err, invites) {
            if (err) res.send(err)
            Invite.findOne({
                    twilio_number: req.query.To,
                    invited_phone: FromNumber
                },
                function(err, sms_sender) {
                    if (err) res.send(err)
                    if (sms_sender) {
                        console.log(req.query.Body)
                    }
                    if (req.query.Body.toLowerCase() == "getout") {
                        console.log("getttttttt   out")
                        console.log(FromNumber)

                        Invite.update({
                                invited_phone: FromNumber,
                                event_id: sms_sender.event_id,
                                //_id: invite_id
                            }, {
                                $set: {
                                    invite_status: "Opted Out",
                                }
                            },
                            function(err, result) {
                                if (err)
                                    throw err;
                                console.log("opppppppt")
                                console.log(result);
                            });
                    }
                    //io.sockets.emit("mms", sms_sender.event_id);
                    Comments.create({
                            event_id: sms_sender.event_id,
                            displayname: sms_sender.invited,
                            text: req.query.Body
                        },
                        function(err, result) {
                            if (err) throw err;
                        });
                    invites.forEach(function(doc) {
                        if (doc.invited_phone) {
                            console.log(doc.invited_phone)
                            client.sendMessage({
                                to: '+1' + doc.invited_phone,
                                from: req.query.To,
                                body: sms_sender.invited + ' says: ' + req.query.Body

                            }, function(err, responseData) {
                                res.end('Done')
                                if (!err) {}
                            });
                        }
                    });
                });
        });


    /*
        Invite.create({
                event_id: req.params.event_id,
                invited_email: req.query.From,
                invite_status: req.query.MediaUrl0
            },
            function(err, result) {
                if (err)
                    throw err;
            });
        io.sockets.emit("mms", req.params.event_id);
    */
}