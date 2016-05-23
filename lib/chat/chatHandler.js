
var help = function(bot, msg, usr) {
    var channel = msg.channel;
    bot.sendMessage(channel, [
        "**~means it requires user to be on admin list~**",
        "Available commands are:",
        "`" + prefix + "destroy:` leaves the voice channel",
        "`" + prefix + "help:` Displays the list of commands",
        "`" + prefix + "np:` Displays the currently playing song",
        "`" + prefix + "pause:` stop playing music",
        "`" + prefix + "play:` starts/resumes playing music",
        "`" + prefix + "queue:` Shows the playlist queue for the server",
        "`" + prefix + "request <link to song>:` adds a song from soundcloud or youtube to the music playlist",
        "`" + prefix + "shuffle:` Shuffles the playlist of songs for this server",
        "`" + prefix + "skip:` skips current song (allow once every 12 seconds)",
        "`" + prefix + "slap:` Hit a user with a random object",
        "`" + prefix + "summon:` joins the voice channel you are in on the server",
        "`" + prefix + "volume:` changes the volume of the music (default volume defined in options.json)"
    ].join("\n"));
}

var slap = function(bot, msg, usr) {
    console.log("test");
}

var stats = function(bot, msg, usr) {
    msg.reply([
        "I am connected/have access to:",
        bot.servers.length + " servers",
        bot.channels.length + " channels",
        bot.users.length + " users",
    ].join("\n"));
}

module.exports = {
    help: help,
    slap: slap,
    stats: stats
};
