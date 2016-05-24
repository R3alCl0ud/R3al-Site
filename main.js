var bot = require("./bot").Bot();
var express = require('express'),
    server = express();

var app = server.listen(3000);
console.log('Listening at https://r3alb0t.xyz:3000');

var io = require('socket.io').listen(app);
var mysql = require('mysql');

var Auth = require('./auth.json');

var connection = mysql.createConnection({
    host: Auth.dbHost,
    user: Auth.dbUser,
    password: Auth.dbPass,
    database: 'discordBot'
});

server.set('view engine', 'ejs');


bot.botEvents.on('msgSent', function(args) {

    console.log("callback: " + args);
});

server.use(express.static('views'));


server.get('/', function(req, res) {
    res.send("Currently down for running tests");
})

server.get('/test', function(req, res) {

    res.render('test.ejs');
});

server.get('/test/table', function(req, res) {

    var playlist;
    var Guild = {};
    connection.query('SELECT * FROM ??', ['\'105399615683092480\''], function(err, results, fields) {
        if (err) {
            console.log(err);
        }
        playlist = results;
        console.log(playlist);
        res.render('test-table.ejs', { playlist: playlist });
    });
});

io.on('connection', function(socket) {
    console.log('a user connected');
    console.log(socket.handshake.headers.referer);
    var songEnd = function songEnd() {
        console.log("does this work?");
        io.emit('songEnd');
        //bot.boatEvents.removeListener('songEnd', songEnd);
    }

    if (socket.handshake.headers.referer == "https://r3alb0t.xyz/terminal/:gid/music") {
        console.log("table loaded");
        bot.botEvents.on('songEnd', songEnd);
    }

    socket.on('disconnect', function() {
        console.log("disconnected");
        console.log(require('events').EventEmitter.listenerCount(bot.botEvents, 'songEnd'));
        bot.botEvents.removeListener('songEnd', songEnd);
        console.log(require('events').EventEmitter.listenerCount(bot.botEvents, 'songEnd'));
    });
});

server.get('/test/music', function(req, res) {
    bot.playMusic();
    res.redirect('/test');
});

server.get('/test/stop', function(req, res) {
    bot.playStop();
    res.redirect('/test');
});

server.get('/text/table', function(req, res) {
    res.render('test-table');
});


server.get('/sendMessage', function(req, res) {
    req.msgContent = req.query.message;
    console.log(req.msgContent);
    bot.customMessage(req.msgContent);
    res.send(req.msgContent);
});
