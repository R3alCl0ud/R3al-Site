var events = require('events');
var Discord = require("discord.js");

var bot = new Discord.Client();

bot.loginWithToken("MTc0ODk4NzIyNDkxMjAzNTg0.CiFC7g.oupKHQ6wAWNwdug249W5XNr6kOU");


bot.on("ready", function() {
    console.log("bot is ready");
    var owner = bot.users.get("id", 104063667351322624);

    if (owner.voiceChannel != null)
    {
        bot.joinVoiceChannel(owner.voiceChannel.id);
    }

});

bot.on("disconnected", function() {
    console.log("disconnected!");
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
        bot.voiceConnections[0].stopPlaying();
        bot.voiceConnections[0].playFile('./Fumes.mp3', { volume: 0.05, seek: 100}, function (error, intent) {
            intent.on("end", function () {
                botEvents.emit("songEnd");
            });
        });
        botEvents.emit("musicStarted");
    }

    function playStop() {
        if (bot.voiceConnection)
        {
            bot.voiceConnection.stopPlaying();
        }
    }

    return {
        botEvents: botEvents,
        customMessage: customMessage,
        shuffle: shuffle,
        playMusic: playMusic,
        playStop: playStop
    };
}
