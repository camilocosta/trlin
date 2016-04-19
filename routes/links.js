var db = require('../config/mongo_database.js');
var slug = require('slug');

var jwt = require('jsonwebtoken');
var redisClient = require('../config/redis_database').redisClient;
var tokenManager = require('../config/token_manager');


exports.listLinks = function(req, res) {

	db.Link.find({ _owner: req.user.id }, {"url": 1, "_owner": 1, "dateCreated": 1, "read": 1} )
	//.populate('_owner', 'name username')
	.sort({dateCreated: -1})
	.exec(function(error, links) {
		if(error) res.sendStatus(500);
		//res.json({ links: links });
		res.json(links);
	});

};



exports.saveLink = function(req, res) {

	var usuarioLogado = req.user;

	db.User.findOne({ _id: req.user.id }, 'name', function(error, owner) {

		var link = new db.Link({
			url: req.body.url,
			_owner: owner
		});

		link.save(function (err) {
			if (!err) {

				return res.status(201).json(link);

			} else {
				if(err.name === 'ValidationError') {
					res.statusCode = 400;
					res.json({ 
						error: 'Validation error' 
					});
				} else {
					res.statusCode = 500;
					res.json({ 
						error: 'Server error' 
					});
				}
			}
		});

	});

};



exports.updateLink = function(req, res) {

	var usuarioLogado = req.user;
	var linkId = req.params.id;

	//TODO Pendente validar se o link pertence ao usuario logado

	db.Link.findById(linkId, function (err, link) {
		if(!link) {
			res.statusCode = 404;
			return res.json({ error: 'Not found' });
		}

		//TODO temporariamente apenas alterna entre lido/nao lido
		//link.url = req.body.url;
		if (link.read) {
			link.read = false;
		} else {
			link.read = true;
		}
		
		link.save(function (err) {
			if (!err) {

				return res.status(200).json(link);

			} else {
				if(err.name === 'ValidationError') {
					res.statusCode = 400;
					return res.json({ error: 'Validation error' });
				} else {
					res.statusCode = 500;
					
					return res.json({ error: 'Server error' });
				}
				
				//logar erro
			}
		});
	});

};


exports.deleteLink = function(req, res) {

	//TODO excluir link
	//inicialmente nao tera delete

	return res.status(200);

};
