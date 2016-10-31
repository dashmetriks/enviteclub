// server.js

// set up ========================
var express = require('express');
var app = express(); // create our app w/ express
var server = require('http').createServer(app);
io = require('socket.io')(server);
var path = require('path');
var user = require('./routes/user');
var events = require('./routes/events');
var invites = require('./routes/invites');
var invitepage = require('./routes/invitepage');
var sms = require('./routes/sms');

var multiparty = require('connect-multiparty'),
multipartyMiddleware = multiparty();

var cors = require('cors')
var mongoose = require('mongoose'); // mongoose for mongodb
//var autoIncrement = require('mongoose-auto-increment');
var async = require("async");

var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');
var Invite = require('./app/models/invites');
var Event = require('./app/models/events');
var Player = require('./app/models/players');
var Comments = require('./app/models/comments');
var crypto = require('crypto');
var client = require('twilio')(config.twilio_sid, config.twilio_token);


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


var apiRoutes = express.Router();
var stripe = require("stripe")("sk_test_bHQ01Hnro6LK3iNsx0r6JBs2");

// configuration =================
app.set('superSecret', config.secret);

mongoose.connect('mongodb://localhost:27017/test'); // connect to mongoDB database on modulus.io

app.use(express.static('./public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors())
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;


apiRoutes.use(function(req, res, next) {

    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token !== "null") {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

apiRoutes.post('/charge', function(req, res) {

               console.log("weeeeeee")
	var stripeToken = req.body.stripeToken;
	var totalcharge = req.body.totalcharge;

	var charge = stripe.charges.create({
//		amount: 1100, // amount in cents, again
		amount: totalcharge, // amount in cents, again
		currency: "usd",
		card: stripeToken,
		description: "payinguser@example.com"
	}, function(err, charge) {
		if (err && err.type === 'StripeCardError') {
               console.log("err")
			// The card has been declined
		} else {
               console.log(charge)
			//Render a thank you page called "Charge"
//			res.render('charge', { title: 'Charge' });
		}
	});

});

app.post('/register', user.register);
app.post('/authenticate', user.authenticate);
app.post('/password_reset', user.password_reset);
app.post('/resetpassword/:reset_code', user.resetpassword);
app.get('/resetcheck/:reset_code', user.reset_check);
apiRoutes.get('/userget', user.userget);
apiRoutes.post('/passwordsave', user.passwordsave);
apiRoutes.post('/confirmphone', user.confirmphone);
apiRoutes.post('/usersave', user.usersave);

apiRoutes.post('/new_event', events.new_event);
app.post('/image_upload',multipartyMiddleware, events.image_upload);
app.post('/csv_upload',multipartyMiddleware, sms.csv_upload);
apiRoutes.delete('/events/:event_id', events.delete_event);
apiRoutes.post('/eventsave/:event_id', events.eventsave);
apiRoutes.get('/my_event_list2',  events.my_event_list2);
app.get('/get_all_events',  events.all_events);

app.get('/geteventdata/:event_id', invitepage.geteventdata); 

app.post('/adduserevent2/:event_id/:ustatus/:invite_code', invitepage.adduserevent2);
apiRoutes.get('/join_event/:event_id/:ustatus', invitepage.join_event);

apiRoutes.post('/addcomment/:event_id/',  invitepage.addcomment);

app.get('/geteventinviteanon/:invite_code', invitepage.geteventinviteanon); 
apiRoutes.get('/geteventinvite/:invite_code', invitepage.geteventinvite);

app.get('/geteventanon/:event_id', invitepage.geteventanon); 
apiRoutes.get('/getevent/:event_id', invitepage.getevent);

app.get('/invites/:invite_code', invitepage.getinvite);
apiRoutes.get('/invited/:event_id', invites.invitedlist);

apiRoutes.post('/addinvite/:event_id/', invites.addinvite); 
apiRoutes.delete('/deleteinvite/:invite_id', invites.deleteinvite);
apiRoutes.post('/addphone/:event_id/', invites.addphone); 
apiRoutes.post('/addplan', invites.addplan); 
apiRoutes.post('/sendsms/:event_id/', sms.sendsms);
app.get('/smsdata', sms.smsdata);
apiRoutes.get('/planstatus', sms.planstatus);
apiRoutes.post('/sendcsvsms', sms.sendcsvsms);

app.use('/api', apiRoutes);
app.use(function(req, res) {
    res.sendfile(path.resolve('./public/index.html')); // load the single view file (angular will handle the page changes on the front-end)
});
// listen (start app with node server.js) ======================================
//app.listen(config.port_endpoint);
server.listen(config.port_endpoint);
console.log("App listening on port " + config.port_endpoint);
