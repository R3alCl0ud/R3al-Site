var express  = require('express')
  , session  = require('express-session')
  , passport = require('passport')
  , Strategy = require('passport-discord').Strategy
  , app      = express();

var ejs = require('ejs');
var path = require('path');
var util = require('./util');
var fs = require('fs');
var under = require('./views/js/underscore-min');
var mysql = require('mysql');

var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'password'
    });




connection.query('CREATE DATABASE IF NOT EXISTS test', function (err) {
    if (err) throw err;
    connection.query('USE test', function (err) {
        if (err) throw err;
        connection.query('CREATE TABLE IF NOT EXISTS users('
            + 'id INT NOT NULL AUTO_INCREMENT,'
            + 'PRIMARY KEY(id),'
            + 'name VARCHAR(30)'
            +  ')', function (err) {
                if (err) throw err;
            });
    });
});





app.set('view engine', 'ejs');
  
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'guilds'];
passport.use(new Strategy({
    clientID: '170387125261434880',
    clientSecret: 'mxlGlVeVGDS9Ubdj7IMauYQy_RyW2FJ0',
    callbackURL: 'http://r3alb0t.xyz/bot/callback',
    scope: scopes
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize()); 
app.use(passport.session());
app.get('/bot', passport.authenticate('discord', {
    scope: scopes
}), function(req, res) {});
app.get('/bot/callback',
    passport.authenticate('discord', {
        failureRedirect: '/'
    }),
    function(req, res) {
        res.redirect('/bot/info')
    } // auth success
);
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/bot/info', checkAuth, function(req, res) {
	res.statusCode = 302;
	res.setHeader('Location', 'http://r3alb0t.xyz/');
	res.end();
	userJSON = 'users/' + req.user.id + '.json';
	util.writeJSON(userJSON, req.user);
    res.json(req.user);
});

app.get('/bot/home', function(req, res) {
	res.statusCode = 302;
	res.setHeader('Location', 'http://r3alb0t.xyz/');
	res.end();
});

function checkAuth(req, res, next) {
	if (req.isAuthenticated()) return next();
	
    res.redirect('/bot');
}

app.param('id', function (req, res, next, id) {
	req.user_id = id;
	next();
});

app.use(express.static('views'));


app.get('/', function(req, res) {
    res.render('index.ejs', { user : req.user });
});
app.get('/features', function(req, res) {
    res.render('features.ejs', { user : req.user });
});

app.get('/servers/:id', checkAuth, function(req, res) {

	var user_info = util.openJSON('users/' + req.user_id + '.json');	
	var AdminGuild = [];
	for (var i = 0, n = 0; i < user_info.guilds.length; i++)
	{
		if(user_info.guilds[i].owner == true || (((user_info.guilds[i].permissions >> 5) & 1) == 1))
		{
			AdminGuild[n] = user_info.guilds[i];
			n++;
		}
	}	
	user_info.guilds = under.sortBy( AdminGuild, "name");

	res.render('servers.ejs', { user : req.user, guilds : user_info.guilds });
});

app.get('/servers', function(req, res) {
	res.redirect('/servers/' + req.user.id);
});




app.param('gid', function (req, res, next, gid) {
	req.guild_id = gid;
	next();
});

app.get('/terminal/:gid', checkAuth, function(req, res) {

	var myGuilds = util.openJSON('./guilds.json');
	
	if (myGuilds.guilds.indexOf(req.guild_id) == -1)
	{
		res.redirect("https://discordapp.com/oauth2/authorize?&client_id=170387125261434880&scope=bot&permissions=3148800&guild_id=" + req.guild_id + "&response_type=code&redirect_uri=http://r3alb0t.xyz/servers");
	}
	
	
	res.render('terminal.ejs', { user: req.user, guild: req.guild_id });
});

app.listen(3000, function (err) {
    if (err) return console.log(err)
		console.log(passport)
    console.log('Listening at http://bot.r3alb0t.xyz:3000/bot')
});
