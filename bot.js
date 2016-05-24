var events = require('events');
var Discord = require("discord.js");
var lib = require("./lib");
var config = require("./options.json");
var plugins = require("./plugins");

var cmdList = {};

for (var i = 0; i < plugins.plList.length; i++) {

    var plugin = new plugins.pluginManager(plugins.plList[i], true, {});

    console.log(plugin.type);

    if (plugin.type == "chat") {
        for (cmd in plugin.plugin) {
            if (cmd != "start")
                cmdList[cmd] = plugin.plugin[cmd];
        }
    }
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


bot.loginWithToken(AuthDetails.token);


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

    var contents = msg.content.toLowerCase().split(" ");
    command = contents[0];

    if (msg.author.id != bot.user.id && !msg.author.bot)
    {
        if (command in cmdList)
        {
            cmdList[command].cmd(bot, msg, usr);
            console.log("User: " + usr.username.toString() + " used the command: " + command);
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

    function playMusic(gid) {
        for (var voice in bot.voiceConnections)
        {
            if (bot.voiceConnections[voice].server.id == gid)
            {
                lib.playNext(bot, voice, gid);
            }
        }
        botEvents.emit("musicStarted");
    }

    lib.musicEvents.on("songEnd", function() {
        botEvents.emit("songEnd");
    });

    function playStop(gid) {
        for (var voice in bot.voiceConnections)
        {
            if (bot.voiceConnections[voice].server.id == gid)
            {
                bot.voiceConnections[voice].stopPlaying();
            }
        }
    }

    function pause(sid) {
        VS = serverNum(sid);
        lib.pause(bot, sid, VS);
    }

    function serverNum(gid) {
        for (var voice in bot.voiceConnections)
        {
            if (bot.voiceConnections[voice].server.id == gid)
            {
                return voice;
            }
        }
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
