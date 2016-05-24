var fs = require('fs');
var request = require('request');
var util = require('./util');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'B3$tP4$$',
    database: 'discordBot'
});

exports.handleSClink = function(songLink, server_id, usr, scKey) {

    var newSong = {};
    try {

        request("http://api.soundcloud.com/resolve.json?url=" + songLink + "&client_id=" + scKey, function(error, response, body) {

            connection.query('SELECT * FROM ??', ["'" + server_id.toString() + "'"], function(err, results, fields) {
                songs = results;
                console.log(results);
            });
            body = JSON.parse(body);
            setTimeout(function() {
                if (body.kind == "track") {
                    console.log(body.title + " added by: " + usr.username);
                    newSong = {
                        position: 0,
                        song_id: body.id.toString(),
                        song_name: body.title,
                        song_dur: body.duration,
                        usr_id: usr.id,
                        usr_name: usr.username,
                        song_type: "SoundCloud"
                    };
                    connection.query('INSERT INTO ?? SET ?', ["'" + server_id.toString() + "'", newSong], function(err, result) {
                        if (err) throw err;
                    });
                }
                if (body.kind == "playlist") {
                    for (var i = 0; i < body.tracks.length; i++) {

                        newSong = {
                            position: 0,
                            song_id: body.tracks[i].id.toString(),
                            song_name: body.tracks[i].title,
                            song_dur: body.tracks[i].duration,
                            usr_id: usr.id,
                            usr_name: usr.username,
                            song_type: "SoundCloud"
                        };
                        connection.query('INSERT INTO ?? SET ?', ["'" + server_id.toString() + "'", newSong], function(err, result) {
                            if (err) throw err;
                        });
                    }
                }
            }, 750);
        });
    } catch (err) {
        console.log(err);
    }
}
