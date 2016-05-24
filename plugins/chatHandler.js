var fs = require('fs');
var config = require("../options.json");
var mysql = require('mysql');
var lib = require('../lib');
var options = config.Options;
var serverList = "./servers.json";


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'B3$tP4$$',
    database: 'discordBot'
});

// command prefix
var prefix = options.prefix;
// don't forget your soundcloud api key
var scKey = options.streamKey;

var start = function() {
    console.log("starting chat handler");
    return 'chat';
}


var help = {
    cmd: function(bot, msg, usr) {
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
    },
    description: "Displays the list of commands"
}

var slap = {
    cmd: function(bot, msg, usr) {
        console.log(msg.mentions);
        var randNumMin = 0;
        var fish = ["clown fish", "sword fish", "shark", "sponge cake", "blue berry pie", "banana", "poptart", "the blunt of a sword", "websters dicitonary: hardcopy"];
        var randNumMax = fish.length - 1;
        var pick = (Math.floor(Math.random() * (randNumMax - randNumMin + 1)) + randNumMin);
        bot.sendMessage(msg.channel, msg.mentions[0] + " got slapped with a " + fish[pick] + " by " + usr.toString());
    },
    description: "Slap a user with a random object"
}

var stats = {
    cmd: function(bot, msg, usr) {
        msg.reply([
            "I am connected/have access to:",
            bot.servers.length + " servers",
            bot.channels.length + " channels",
            bot.users.length + " users",
        ].join("\n"));
    },
    description: "get stats about the bot"
}

var summon = {
    cmd: function(bot, msg, usr) {

        var usr = msg.author;
        var msrv = msg.channel.server;
        var dm = msg.channel.isPrivate;
        var chnl = msg.channel;

        if (usr.voiceChannel.server.id == msrv.id) {
            var base = {
                "server": msrv.id,
                "serverName": msrv.name,
                "voiceName": usr.voiceChannel.name,
                "boundChannel": msg.channel.id,
                "voiceChannel": usr.voiceChannel.id,
                "volume": options.volume,
                "paused": false,
                "timePaused": 0,
                "startTime": 0,
                "nowplaying": "",
                "currentTime": 0
            };
            bot.joinVoiceChannel(usr.voiceChannel.id);
            var n = lib.serverIndex(msrv.id);
            console.log(n);
            serversJSON = lib.openJSON("./servers.json");
            if (n == -1) {
                serversJSON.servers[serversJSON.servers.length] = base;
                lib.writeJSON(serverList, serversJSON);
            }

            if (!fs.existsSync('./playlists/' + msrv.id)) {
                fs.mkdirSync('./playlists/' + msrv.id);
            }
            console.log("joined voice channel: " + usr.voiceChannel.name + " in server: " + msrv.toString());
            base = null;
            serversJSON = null;

        } else {
            msg.reply("You are not in a voice channel on this server");
        }
    },
    description: "Sommon the bot to your voice channel"
}
var request = {
    cmd: function(bot, msg, usr) {
        var msrv = msg.channel.server;
        var chnl = msg.channel;
        var songLinkUrl = msg.content.split(" ").slice(1).join(" ");

        songLinkUrl = songLinkUrl.replace("http://", "https://");
        if (songLinkUrl.startsWith("https://soundcloud.com/")) {
            lib.scSong(songLinkUrl, msrv.id, usr, scKey);
        } else if (songLinkUrl.startsWith("https://www.youtube.com/playlist?")) {
            var newplaylist = {
                "url": songLinkUrl,
                "usr": usr.username,
                "id": msg.channel.server.id
            };
            var spot = lib.ytSet(newplaylist);
            newplaylist = null;
            if (spot > 1) {
                bot.sendMessage(chnl, "Already downloading a playlist\nYou are in slot: " + spot + " of the queue", function(error, message) {
                    bot.deleteMessage(message, {
                        wait: 5000
                    });
                });
            } else {
                bot.sendMessage(chnl, "Downloading Playlist...", function(error, message) {
                    bot.deleteMessage(message, {
                        wait: 5000
                    });
                });
            }
        } else if (songLinkUrl.startsWith("https://www.youtube.com/")) {
            lib.ytSong(songLinkUrl, msrv.id, usr);
            setTimeout(function() {
                bot.sendMessage(chnl, "The song has been added to the playlist", function(error, message) {
                    bot.deleteMessage(message, {
                        wait: 7000
                    });
                }, 700);
            });
        }
    },
    description: "Add a song to the playlist"
}

var play = {
    cmd: function(bot, msg, usr) {

        msrv = msg.channel.server;

        if (serverNum(bot, msrv.id) != -1) {
            Vserver = serverNum(bot, msrv.id);
            lib.playNext(bot, Vserver, msrv.id);
        } else {
            msg.reply(["I am not in a voice channel on this server",
                "Put me in a voice channel if you want to play music"
            ].join("\n"));
        }
    },
    description: "Start/resume the music"
}

function serverNum(bot, gid) {
    for (var voice in bot.voiceConnections) {
        if (bot.voiceConnections[voice].server.id == gid) {
            return voice;
        }
    }
    return -1;
}

var destroy = {

    cmd: function(bot, msg, usr) {
        var msrv = msg.channel.server;
        var chnl = msg.channel;
        try {
            if (serverNum(msrv.id) != -1) {
                var i = serverNum(msrv.id);
                var songs = fs.readdirSync('./playlists/' + msrv.id.toString());
                for (var song in songs) {
                    fs.unlinkSync('./playlists/' + msrv.id + '/' + songs[song].toString());
                }

                if (fs.existsSync('./playlists/' + msrv.id)) {
                    fs.rmdirSync('./playlists/' + msrv.id);
                }

                connection.query('DELETE FROM `?`', msrv.id, function(err) {
                    if (err) throw err;
                });
                bot.voiceConnections[i].destroy();
                console.log("I am connected to " + bot.voiceConnections.length + " voice channel(s)");
            }
        } catch (err) {
            console.log(err);
            msg.reply("well... this is akward. destroy is broken...");
        }
    },
    description: "Leaves Voice channel and deletes playlist for the server"
}

var shuffle = {
    cmd: function(bot, msg, usr) {
        var msrv = msg.channel.server;
        var chnl = msg.channel;
        var playlist;
        var SV = lib.serverIndex(msrv.id);
        var serverJSON = lib.openJSON("./servers.json");

        connection.query('SELECT * FROM `?`', msrv.id.toString(), function(err, results, fields) {
            if (err) throw err;
            playlist = results;
        });
        setTimeout(function() {
            var channel = serverJSON.servers[SV].boundChannel.toString();
            for (var i = playlist.length - 1; i > 1; i--) {
                var n = Math.floor(Math.random() * (i + 1));
                if (n != 0) {
                    var temp = playlist[i];
                    playlist[i] = playlist[n];
                    playlist[n] = temp;
                } else {
                    i++;
                }
            }
            bot.sendMessage(channel, "**Shuffle :diamonds: Shuffle :spades: Shuffle :hearts:**", function(error, message) {
                if (error) {
                    console.log(error);
                }
                bot.deleteMessage(message, {
                    wait: 7000
                });
            });
            setTimeout(function() {
                connection.query('TRUNCATE `?`', msrv.id.toString(), function(err) {
                    if (err) throw err;
                });
            }, 100);

            setTimeout(function() {
                for (var i = 0; i < playlist.length; i++) {
                    playlist[i].position = i + 1;
                    connection.query('INSERT INTO ?? SET ?', ["'" + msrv.id.toString() + "'", playlist[i]], function(err, result) {
                        if (err) throw err;
                    });
                }
            }, 200);

            setTimeout(function() {
                playlist = null;
                serverJSON = null;
            }, 300);
        }, 400);
    },
    description: "Shuffles the playlist"
}


var volume = {
    cmd: function(bot, msg, usr) {
        var msrv = msg.channel.server;
        var chnl = msg.channel;
        if (msg.content.split(" ").slice(1).join(" ").toUpperCase() == "EAR RAPE") {
            var volume = Math.pow(10, 100);
            if (serverNum(bot, msrv.id) != -1) {
                Vserver = serverNum(bot, msrv.id);
                var serverJSON = lib.openJSON(serverList);
                var VS = lib.serverIndex(msrv.id);
                serverJSON.servers[VS].volume = volume;
                lib.writeJSON(serverList, serverJSON);
                try {
                    bot.voiceConnections[Vserver].setVolume(volume);
                    bot.sendMessage(chnl, "Volume set to: EAR RAPE");
                } catch (err) {
                    console.log(err);
                    bot.sendMessage(chnl, "Put me in a voice channel first!");
                }
                console.log("The user " + usr.toString() + " used the volume command");
                console.log("Volume set to " + (volume * 100) + "%");
            }
        } else {
            var volume = (msg.content.split(" ").slice(1).join(" ") / 100);
            if (Math.abs(volume) <= 2) {
                if (serverNum(bot, msrv.id) != -1) {
                    Vserver = serverNum(bot, msrv.id);
                    var serverJSON = lib.openJSON(serverList);
                    var VS = lib.serverIndex(msrv.id);
                    serverJSON.servers[VS].volume = volume;
                    lib.writeJSON(serverList, serverJSON);
                    try {
                        bot.voiceConnections[Vserver].setVolume(volume);
                        bot.sendMessage(chnl, "Volume set to: " + (volume * 100) + "%");
                    } catch (err) {
                        console.log(err);
                        bot.sendMessage(chnl, usr + ", Put me in a voice channel first!");
                    }
                    console.log("The user " + usr.toString() + " used the volume command");
                    console.log("Volume set to " + (volume * 100) + "%");
                } else {
                    bot.sendMessage(chnl, usr + ", Put me in a voice channel first!");
                }
            } else {
                bot.sendMessage(chnl, usr + ", Please Use a Reasonable Volume")
            }
        }
    },
    description: "Changes the volume of the music (default volume defined in options.json)"
}

var queue = {
    cmd: function (bot, msg, usr) {
        var usr = msg.author;
        var msrv = msg.channel.server;
        var dm = msg.channel.isPrivate;
        var channel = msg.channel;
        var queue = ["Current Playlist:", "", ""];
        try {
            var songs;

            connection.query('SELECT * FROM `?`', [msrv.id], function(err, results, fields) {
                if (err) throw err;
                songs = results;
            });

            setTimeout(function() {
                var queueWord = queue;
                var n = 0;
                if (songs.length > 20) {
                    n = 20;
                } else {
                    n = songs.length;
                }
                for (var i = 0; i < n; i++) {
                    if ((queueWord + "**" + (i + 1) + "**:  `" + songs[i].song_name.toString() + "`, <@" + songs[i].usr_id.toString() + ">").length <= 2000 && i < songs.length) {
                        queue.push(("**" + (i + 1) + "**:  `" + songs[i].song_name.toString() + "`, <@" + songs[i].usr_id.toString() + ">"));
                        queueWord = queue;
                    } else {
                        break;
                    }
                }
                queue.push("");
                queue.push("");
                queue.push("Playlist total length: " + songs.length);
                queueWord = queue;
                bot.startTyping(channel);
                setTimeout(function() {
                    bot.stopTyping(channel);
                    bot.sendMessage(channel, queueWord, function(error, message) {
                        bot.deleteMessage(message, {wait: 7000});
                    });
                }, 750);
                songs = null;
            }, 100);
        } catch (err) {
            console.log(err);
        }
    },
    description: "Shows the server's playlist"
}

var pause = {
    cmd: function (bot, msg, usr) {
        var usr = msg.author;
        var msrv = msg.channel.server;
        var dm = msg.channel.isPrivate;
        var chnl = msg.channel;
        var srv = serverNum(msrv.id);
        lib.pause(bot, msrv.id, srv);
    },
    description: "Pause the currently playing song"
}




module.exports = {
    start: start,
    destroy: destroy,
    help: help,
    pause: pause,
    play: play,
    queue: queue,
    request: request,
    shuffle: shuffle,
    slap: slap,
    stats: stats,
    summon: summon,
    volume: volume
};


connection.query('SELECT * FROM `cmd`', function(err, results, fields) {
    if (err) throw err;
    console.log(results);
    for (cmd in results) {
        module.exports[cmd.title] = {
            cmd: function(bot, msg, usr) {
                if (msg.channel.server.id == cmd.guild_id)
                    bot.sendMessage(msg.channel, cmd.message);
            },
            description: cmd.description
        }
    }
});
