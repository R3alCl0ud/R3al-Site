var events = require('events');
var Discord = require("discord.js");
var music = require("./lib/voice/music");
var config = require("./options.json");
var cmds = require("./lib/cmds");

console.log(cmds);

for (var cmd in cmds)
{
    console.log(cmd);
}

// Get the email and password or token
var AuthDetails = config.Auth;

var bot = new Discord.Client({
    autoReconnect: true
});


var options = config.Options;

// command prefix
var prefix = options.prefix;

// don't forget your soundcloud api key
var scKey = options.streamKey;


bot.loginWithToken();


bot.on("ready", function() {
    console.log("bot is ready");

    setTimeout(function() {
        bot.setPlayingGame("https://r3alb0t.xyz");
    }, 3000);
});

bot.on("disconnected", function() {
    console.log("disconnected!");
});

bot.on("message", function(msg) {
    var usr = msg.author;
    var msrv = msg.channel.server;
    var dm = msg.channel.isPrivate;
    var chnl = msg.channel;

    if (!msg.content.startsWith(prefix)) return;

    msg.content = msg.content.substr(prefix.length);
    contents = msg.content.toLowerCase().split(" ");

    if (msg.author.id != bot.user.id && !msg.author.bot) {
        if (contents[0] in cmds)
        {
            cmds[msg.content.toLowerCase()](bot, msg, usr);
            console.log("User: " + usr.username.toString() + " used the command: " + contents[0]);
        }
    }
});

exports.Bot = function() {
    var botEvents = new events.EventEmitter();

    function customMessage(msgContent) {

        var channel = bot.channels.get("id", 105399615683092480);

        bot.sendMessage(channel, msgContent);

        botEvents.emit("msgSent", bot.user.username);
    }


    function shuffle() {

    }

    function playMusic() {
        music.playNext(bot, 0, 105399615683092480);
        botEvents.emit("musicStarted");
    }

    music.musicEvents.on("songEnd", function() {
        botEvents.emit("songEnd");
    });

    function playStop() {
        if (bot.voiceConnection) {
            bot.voiceConnection.stopPlaying();
        }
    }

    function pause(sid) {
        music.pause(bot, sid, 0);
    }

    return {
        botEvents: botEvents,
        customMessage: customMessage,
        shuffle: shuffle,
        playMusic: playMusic,
        playStop: playStop,
        pause: pause
    };
}
