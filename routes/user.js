var jwt = require('jsonwebtoken');
var User = require('../app/models/user');
var Passwordreset = require('../app/models/passreset');
var express = require('express');
var app = express(); // create our app w/ express
var config = require('../config');
var bcrypt = require('bcrypt');
var client = require('twilio')(config.twilio_sid, config.twilio_token);

var crypto = require('crypto');
var salt = bcrypt.genSaltSync(10);

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len); // return required number of characters
}
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.username,
        pass: config.password
    }
});
app.set('superSecret', config.secret);

exports.register = function(req, res) {
    User.find({
  //      username: req.body.name
       // phone: req.body.phone
        $or:[ {'username':req.body.name}, {'phone':req.body.phone},  ]
    }, function(err, user) {
 

        if (err)
            throw err;

        if (user.length < 1) {
            var newuser = new User({
                username: req.body.name,
                phone: req.body.phone,
                confirm_phone_code: randomValueHex(4),
                password: bcrypt.hashSync(req.body.password, salt)
            });
            newuser.save(function(err, new_user) {
                if (err) throw err;
                
                    client.sendMessage({
                        to: '+1' + req.body.phone, 
                        from: '+14152149049', 
                        body: "Please enter code " + new_user.confirm_phone_code + " to confirm this number"

                    }, function(err, responseData) { 
                        if (!err) { }
                    });

                    client.sendMessage({
                        to: '+14157865548', 
                        from: '+14152149049', 
                        body: "New user signed up-" + req.body.name 

                    }, function(err, responseData) { 
                        if (!err) { }
                    });

                res.json({
                    success: true,
                    message: 'Please check your phone for confirmation code'
                });
            });

        } else if (user) {
            res.json({
                success: false,
                message: 'User with that phone number or email already exists - Please login'
            });

        }

    });
}

exports.password_reset = function(req, res) {

    User.findOne({
        username: req.body.username
    }, function(err, user) {

        if (err)
            throw err;

        if (!user) {
            res.json({
                success: false,
              //  message: 'Authentication failed. User not found.'
                message: 'Email not found. Please try again'
            });
        } else if (user) {
            Passwordreset.create({
                    reset_email: req.body.username,
                    reset_code: randomValueHex(8),
                    reset_status: "Sent"
                },
                function(err, password_reset) {
                    transporter.sendMail({
                        from: config.username,
                        to: req.body.username,
                        subject: 'You have requested a password reset',
                        html: 'this is a one time reset code <a href="' + config.endpoint + '/reset_password/' + password_reset.reset_code + '">reset password</a>',
                    });
                    transporter.close();
                    if (err)
                        throw err;
            res.json({
                success: true,
              //  message: 'Authentication failed. User not found.'
                message: 'Reset request successfull.  Please check your email'
            });
                });
        }

    });
}

exports.reset_check = function(req, res) {
    Passwordreset.findOne({
            reset_code: req.params.reset_code,
        },
        function(err, reset_password) {
            if (err) res.send(err)
            if (reset_password) {
              if (reset_password.reset_status == "Sent"){
                res.json({
                    success: true,
                    message: 'please reset password.'
                });
              } else {
                res.json({
                    success: false,
                    message: 'Reset code already used. Please request another'
                });
              }
            } else {
                res.json({
                    success: false,
                    message: 'Please request another password reset.'
                });
                /*
                                return res.status(403).send({
                                    success: false,
                                    message: 'No Invite for that code.'
                                });
                */
            }
        });
}
exports.authenticate = function(req, res) {

    User.findOne({
        username: req.body.name
    }, function(err, user) {

        if (err)
            throw err;

        if (!user) {
            res.json({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        } else if (user) {

console.log('passss');
         console.log(req.body.password);
         console.log(bcrypt.hashSync(req.body.password, salt));
         console.log(user.password);
         console.log('dldldl');
         console.log(bcrypt.compareSync(req.body.password, user.password));
         console.log('ooooo');
         

            // check if password matches
            //if (user.password != bcrypt.hashSync(req.body.password, salt)) {
            if (!bcrypt.compareSync(req.body.password, user.password)) {  
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.'
                });
            } else {

                // if user is found and password is right
                // create a token
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresInMinutes: 1440 // expires in 24 hours
                });


                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    user_displayname: user.displayname,
                    phone_confirmed: user.phone_confirmed,
                    token: token
                });
            }

        }

    });
}

exports.usersave = function(req, res) {
   console.log(req.body.phone);
    User.update({
            _id: req.decoded._doc._id
        }, {
            $set: {
                username: req.body.username,
                displayname: req.body.displayname,
                phone: req.body.phone
            }
        },
        function(err, users) {
            if (err)
                throw err;
            //res.json(result);
            res.json({
                'user': users,
            });
        });
}

exports.resetpassword = function(req, res) {
    Passwordreset.findOne({
            reset_code: req.params.reset_code,
        },
        function(err, reset_password) {
            if (err) res.send(err)
            if (reset_password) {
                console.log(reset_password.reset_email)
                User.update({
                        username: reset_password.reset_email
                    }, {
                        $set: {
                            password: bcrypt.hashSync(req.body.password, salt)
                        }
                    },
                    function(err, users) {
                        if (err)
                            throw err;
                 
                        res.json({
                            success: true,
                            message: 'password has been reset.  please login.'
                        });
                    });
    Passwordreset.update({
            reset_code: req.params.reset_code,
                    }, {
                        $set: {
                            reset_status: "Used"
                        }
                    },
                    function(err, pstatus) {
                        if (err)
                            throw err;
                 
                      //  res.json({
                     //       success: true,
                      //      message: 'password has been reset.  please login.'
                     //   });
                    });
                //        res.json({
                //           success: true,
                //          message: 'please reset password.'
                //      });
            } else {
                res.json({
                    success: false,
                    message: 'reset code already used.'
                });
                /*
                                return res.status(403).send({
                                    success: false,
                                    message: 'No Invite for that code.'
                                });
                */
            }
        });
    /*
        User.update({
                _id: req.decoded._doc._id
            }, {
                $set: {
                    password: bcrypt.hashSync(req.body.password, salt) 
                }
            },
            function(err, users) {
                if (err)
                    throw err;
                //res.json(result);
                res.json({
                    success: true,
                    message: 'password has been reset.  please login.'
                });
                //res.json({
               //     'user': users,
              //  });
            });
    */
}

exports.confirmphone = function(req, res) {
    User.find({
            _id: req.decoded._doc._id
        },
        function(err, users) {
            if (err) res.send(err)
        if (req.body.confirmphone == users[0].confirm_phone_code ){
            console.log('ooooooo yeah baby')
            User.update({
                    _id: req.decoded._doc._id
                }, {
                    $set: {
                        phone_confirmed: "true" 
                    }
                },
                function(err, usersconfirm) {
                    if (err)
                        throw err;
                        res.json({
                            success: true,
                            message: 'Phone has been confirmed. Thanks!'
                        });
                    //res.json({
                  //      'user': usersconfirm,
                   // });
            });
        }else{
                        res.json({
                            success: true,
                            message: 'Sorry. Wrong code. Try Again'
                        });

        }

            //res.json({
           //     'user': users,
            //});
        });
/*
    User.update({
            _id: req.decoded._doc._id
        }, {
            $set: {
                password: bcrypt.hashSync(req.body.password, salt)
            }
        },
        function(err, users) {
            if (err)
                throw err;
            //res.json(result);
            res.json({
                'user': users,
            });
        });
*/
}

exports.passwordsave = function(req, res) {
    User.update({
            _id: req.decoded._doc._id
        }, {
            $set: {
                password: bcrypt.hashSync(req.body.password, salt)
            }
        },
        function(err, users) {
            if (err)
                throw err;
            //res.json(result);
            res.json({
                'user': users,
            });
        });
}

exports.userget = function(req, res) {
    console.log("asdfasfdasfads")
    console.log(req.decoded._doc._id)
    User.find({
            _id: req.decoded._doc._id
        },
        function(err, users) {
            if (err)
                res.send(err)
            res.json({
                'user': users,
            });
        });
}
