var express = require('express');
var jwt = require('express-jwt');
var bodyParser = require('body-parser');
var morgan  = require('morgan');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var tokenManager = require('./config/token_manager');

var dotenv = require('dotenv');
dotenv.load({ path: '.env' });

var secretToken = process.env.REDIS_SECRET_TOKEN;

//Routes
var routes = {};
routes.links = require('./routes/links');
routes.users = require('./routes/users');

var http = require('http');
var path = require('path');

var app = express();

app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://www.trlin.com');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  if ('OPTIONS' == req.method) return res.sendStatus(200);
  next();
});

// all environments
app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(errorHandler());


//cadastrar usuário
app.post('/auth/register', routes.users.register);

//fazer login
app.post('/auth/login', routes.users.login); 


//list all links
app.get('/links', 
	jwt({secret: secretToken}),
	tokenManager.verifyToken,
	routes.links.listLinks);

//save new link
app.post('/links', 
	jwt({secret: secretToken}),
	tokenManager.verifyToken,
	routes.links.saveLink);

//edit link
app.put('/links/:id',
	jwt({secret: secretToken}),
	tokenManager.verifyToken,
	routes.links.updateLink);

//delete link
app.delete('/links/:id',
	jwt({secret: secretToken}),
	tokenManager.verifyToken,
	routes.links.deleteLink);


http.createServer(app).listen(app.get('port'), function(){
  console.log('TRLIN API server listening on port ' + app.get('port'));
});
