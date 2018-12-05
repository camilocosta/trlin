var db = require('../config/mongo_database.js');
var jwt = require('jsonwebtoken');
var redisClient = require('../config/redis_database').redisClient;
var tokenManager = require('../config/token_manager');

var dotenv = require('dotenv');
dotenv.load({ path: '.env' });

var secretToken = process.env.REDIS_SECRET_TOKEN;

exports.register = function(req, res){
	
	var user = new db.User(req.body);
	
	user.save(function(error, user) {
		if(error) {
			if (error.code == '11000') {
				return res.status(400).json({ message: "Usuário já existe" });
			}
			return res.sendStatus(500);
		}
		return res.sendStatus(201);
	});

};


exports.login = function(req, res) {

	var username = req.body.username || '';
	var password = req.body.password || '';
	
	if (username == '' || password == '') { 
		return res.send(401); 
	}
	
	db.User.findOne({username: username}, function (err, user) {
		if (err) {
			console.log(err);
			return res.send(401);
		}

		if (user == undefined) {
			return res.send(401);
		}
		
		user.comparePassword(password, function(isMatch) {
			if (!isMatch) {
				console.log("Attempt failed to login with " + user.username);
				return res.send(401);
            }

			var token = jwt.sign({id: user._id}, secretToken, { expiresIn: 60 * 60 } );
			
			var userReturn = {};
			userReturn.name = user.name;
			userReturn.username = user.username;

			return res.json({ user: userReturn, token:token });
		});

	});
	

};



