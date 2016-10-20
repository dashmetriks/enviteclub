var config = require('../config');
var User = require('../app/models/user');
var Invite = require('../app/models/invites');
var Event = require('../app/models/events');
var Player = require('../app/models/players');
var Comments = require('../app/models/comments');
var Twilio = require('../app/models/twilio');
var async = require("async");
var crypto = require('crypto');
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

exports.new_event = function(req, res) {

    User.findOne({
        _id: req.decoded._doc._id
    }, function(err, user) {

        if (err)
            throw err;
        Twilio.findOne({
                "number_status": "free"
            },
            function(err, twilio) {
                if (err) res.send(err)
                console.log(twilio);

                Event.create({
                    event_title: req.body.text,
                    event_start: req.body.event_start,
                    event_time: req.body.event_time,
                    event_location: req.body.event_location,
                    event_creator: req.decoded._doc._id,
                    event_image: req.body.image,
                    //event_twilio_number: '+15102294542',
                    event_twilio_number: twilio.twilio_number,
                    event_creator_displayname: user.displayname

                }, function(err, event_created) {
                    if (err)
                        res.send(err);

                    Twilio.update({
                            twilio_number: twilio.twilio_number
                        }, {
                            $set: {
                                number_status: "used"
                            }
                        },
                        function(err, result) {
                            if (err)
                                throw err;
                            console.log(result)
                        });





                    Invite.create({
                            event_id: event_created._id,
                            inviter: user.username,
                            invited: user.displayname,
                            invited_email: user.username,
                            //  twilio_number: '+14152149049',
                            twilio_number: twilio.twilio_number,
                            invited_phone: user.phone,
                            //     invited_email: req.body.email,
                            //    invited_phone: req.body.phone,
                            //     invited_type: req.body.type,
                            invite_code: randomValueHex(8),
                            event_creator: "Yes",
                            invite_status: "Sent"
                        },
                        function(err, new_invite) {
                            Player.create({
                                    event_id: event_created._id,
                                    displayname: user.displayname,
                                    invite_code: new_invite.invite_code,
                                    username: user.username,
                                    notice_rsvp: 'YES',
                                    notice_comments: 'YES',
                                    user_id: req.decoded._doc._id,
                                    in_or_out: 'Yes'
                                },
                                function(err, result) {
                                    if (err)
                                        throw err;
                                    transporter.sendMail({
                                        from: config.username,
                                        to: user.username,
                                        subject: 'You created the event ' + event_created.event_title + ' at ' + event_created.event_start,
                                        html: 'You created the event <a href="' + config.endpoint + '/invite/' + new_invite.invite_code + '">' + event_created.event_title + '</a>' + ' at ' + event_created.event_start,
                                    });
                                    transporter.close();
                                    if (err)
                                        throw err;
                                }); //d8d88d
                        });
                    Event.find(function(err, events) {
                        if (err)
                            res.send(err)
                        res.json(events);
                    });
                });
            });
    });
}

exports.image_upload = function(req, res) {
    console.log("tototot")
    console.log(req.files)




    var file = req.files.file;
    console.log(file.name);
    console.log(file.type);
    console.log(file.path);
    fs = require('fs')
    fs.readFile(file.path, function(err, data) {
        if (err) throw err;
        file_name = randomValueHex(8) + '_' + file.name;
        file_name_loc = 'public/uploads/' + file_name;
        fs.writeFile(file_name_loc, data, function(err) {
            //fs.writeFile('./uploads/' + randomValueHex(8) + '_' + file.name, data, function (err) {
            if (err) throw err;
            console.log('It\'s saved!');
            res.json({
                'file_name': file_name
            });
        });
    });

    //   res.send(200, { result: "ok" });
}





exports.delete_event = function(req, res) {
    Event.findOne({
            _id: req.params.event_id
        },
        function(err, events2) {
            if (err)
                res.send(err)
            Twilio.update({
                    twilio_number: events2.event_twilio_number
                }, {
                    $set: {
                        number_status: "free"
                    }
                },
                function(err, result) {
                    if (err)
                        throw err;
                    console.log(result)
                });
        });

    Event.remove({
        _id: req.params.event_id
    }, function(err, events) {
        if (err) res.send(err);
        Player.remove({
            event_id: req.params.event_id
        }, function(err, players) {
            if (err) res.send(err);
            //res.json(events);
        });
        Invite.remove({
            event_id: req.params.event_id
        }, function(err, invites) {
            if (err) res.send(err);
            res.json(invites);
        });
    });
}

exports.eventsave = function(req, res) {
    Event.update({
            _id: req.params.event_id
        }, {
            $set: {
                event_title: req.body.event_title,
                event_location: req.body.event_location,
                event_start: req.body.event_start
            }
        },
        function(err, result) {
            if (err)
                throw err;
            console.log(result)
            res.json(result);
        });
}

exports.my_event_list2 = function(req, res) {
    var player_data = []
    var player_data2 = []
    var player_data3 = []
    var player_no_count = []
    var pushY = {};
    var comments_array = {}
    var pushN = {};
    var pushList = {};
    var invites_cnt = {};
    Player.find({
            user_id: req.decoded._doc._id
        }, null, {
            sort: {
                "created_at": -1
            }
        },
        function(err, records) {
            async.each(records, function(events, callback) {
                Event.findOne({
                        _id: events.event_id
                    },
                    function(err, events2) {
                        if (err)
                            res.send(err)
                        player_data.push(events2);
                    });
                Player.count({
                        event_id: events.event_id,
                        in_or_out: 'No'
                    },
                    function(err, players_no) {
                        if (err)
                            res.send(err)
                        Player.count({
                                event_id: events.event_id,
                                in_or_out: 'Yes'
                            },
                            function(err, players_yes) {
                                if (err)
                                    res.send(err)
                                Invite.count({
                                        event_id: events.event_id
                                    },
                                    function(err, invite_count) {
                                        if (err) res.send(err)

                                        Comments.count({
                                                event_id: events.event_id
                                            },
                                            function(err, comments_count) {
                                                if (err) res.send(err)

                                                Player.find({
                                                        user_id: req.decoded._doc._id,
                                                        event_id: events.event_id
                                                    },
                                                    function(err, players_list) {
                                                        if (err)
                                                            res.send(err)
                                                            // player_data3.push(players_list);
                                                        pushList[events.event_id] = players_list
                                                        pushN[events.event_id] = players_no
                                                        pushY[events.event_id] = players_yes
                                                        comments_array[events.event_id] = comments_count
                                                        invites_cnt[events.event_id] = invite_count
                                                        callback();
                                                    });
                                            });
                                    });
                            });
                    });
            }, function(err) {
                res.json({
                    'my_events': player_data,
                    'event_yes': [pushY],
                    'logged_in_userid': req.decoded._doc._id,
                    'event_invites': [pushList],
                    //  'event_invites': player_data3,
                    'event_no': [pushN],
                    'comments_count': [comments_array],
                    'invites': [invites_cnt]
                });
            });
        });
}

exports.all_events = function(req, res) {
    var player_data = []
    var player_data2 = []
    var player_data3 = []
    var player_no_count = []
    var pushY = {};
    var comments_array = {}
    var pushN = {};
    var pushList = {};
    var invites_cnt = {};
    Event.find({}, null, {
            sort: {
                "created_at": -1
            }
        },
        function(err, records) {
            console.log(records);
            async.each(records, function(events, callback) {
                Event.findOne({
                        _id: events._id
                    },
                    function(err, events2) {
                        if (err)
                            res.send(err)
                        player_data.push(events2);
                    });
                Player.count({
                        event_id: events._id,
                        in_or_out: 'No'
                    },
                    function(err, players_no) {
                        if (err)
                            res.send(err)
                        Player.count({
                                event_id: events._id,
                                in_or_out: 'Yes'
                            },
                            function(err, players_yes) {
                                if (err)
                                    res.send(err)
                                Invite.count({
                                        event_id: events._id
                                    },
                                    function(err, invite_count) {
                                        if (err) res.send(err)

                                        Comments.count({
                                                event_id: events._id
                                            },
                                            function(err, comments_count) {
                                                if (err) res.send(err)

                                                Player.find({
                                                        //    user_id: req.decoded._doc._id,
                                                        event_id: events._id
                                                    },
                                                    function(err, players_list) {
                                                        if (err)
                                                            res.send(err)
                                                            // player_data3.push(players_list);
                                                        pushList[events._id] = players_list
                                                        pushN[events._id] = players_no
                                                        pushY[events._id] = players_yes
                                                        comments_array[events._id] = comments_count
                                                        invites_cnt[events._id] = invite_count
                                                        callback();
                                                    });
                                            });
                                    });
                            });
                    });
            }, function(err) {
                res.json({
                    'my_events': player_data,
                    'event_yes': [pushY],
                    'event_invites': [pushList],
                    //  'event_invites': player_data3,
                    'event_no': [pushN],
                    'comments_count': [comments_array],
                    'invites': [invites_cnt]
                });
            });
        });
}