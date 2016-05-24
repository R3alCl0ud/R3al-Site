var express = require('express'),
    session = require('express-session'),
    passport = require('passport'),
    Strategy = require('passport-discord').Strategy,
    app = express();

var ejs = require('ejs');
var path = require('path');
var util = require('./util');
var fs = require('fs');
var under = require('./views/js/underscore-min');
var mysql = require('mysql');
var request = require('request');
var Auth = require('./auth.json');

var connection = mysql.createConnection({
    host: Auth.dbHost,
    user: Auth.dbUser,
    password: Auth.dbPass,
    database: 'discordBot'
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
    callbackURL: 'https://r3alb0t.xyz/bot/callback',
    scope: scopes
}, function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function() {
        return cb(null, profile);
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
    res.setHeader('Location', 'https://r3alb0t.xyz/');
    res.end();
    connection.query('SELECT * FROM `users` WHERE `user_id` = ?', [req.user.id], function(err, results, fields) {
        if (err) throw err;

        if (results.length == 0) {
            var user;
            if (req.user.avatar != null)
                user = {
                    user_id: req.user.id.toString(),
                    user_name: req.user.username,
                    user_avatar: req.user.avatar
                };
            else
                user = {
                    user_id: req.user.id.toString(),
                    user_name: req.user.username,
                    user_avatar: "defualt"
                };
            connection.query('INSERT INTO users  SET ?', user, function(err, result) {
                if (err) throw err;
            });
        }
    });
});

app.get('/bot/home', function(req, res) {
    res.statusCode = 302;
    res.setHeader('Location', 'https://r3alb0t.xyz/');
    res.end();
});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();

    res.redirect('/bot');
}

function checkGuild(guildId, user) {

    for (var i = 0; i < user.guilds.length; i++)
    {
        if (user.guilds[i].id == guildId && (((user.guilds[i].permissions >> 5) & 1) == 1))
        {
            return;
        } else if (user.guilds[i].id == guildId && (((user.guilds[i].permissions >> 5) & 1) == 0))
        {
            break;
        }
    }
    res.redirect('/servers');
}

app.param('id', function(req, res, next, id) {
    req.user_id = id;
    next();
});

app.use(express.static('views'));

app.get('/', function(req, res) {
    console.log(passport.instance);
    res.render('index.ejs', {
        user: req.user
    });
});
app.get('/features', function(req, res) {
    res.render('features.ejs', {
        user: req.user
    });
});

app.get('/servers/:id', checkAuth, function(req, res) {

    var user_info = {};
    var AdminGuild = [];
    for (var i = 0, n = 0; i < req.user.guilds.length; i++) {
        if (req.user.guilds[i].owner == true || (((req.user.guilds[i].permissions >> 5) & 1) == 1)) {
            AdminGuild[n] = req.user.guilds[i];
            n++;
        }
    }
    user_info.guilds = under.sortBy(AdminGuild, "name");

    res.render('servers.ejs', {
        user: req.user,
        guilds: user_info.guilds
    });
});

app.get('/servers', checkAuth, function(req, res) {
    console.log(req.query.guild_id);
    if (req.query.guild_id) {
        var guild = {
            url: 'https://discordapp.com/api/guilds/' + req.query.guild_id,
            headers: {
                'Authorization': 'Bot ' + Auth.token
            }
        };
        res.redirect('/terminal/' + req.query.guild_id);
    }
    res.redirect('/servers/' + req.user.id);

});

app.param('gid', function(req, res, next, gid) {
    req.guild_id = gid;
    next();
});

app.get('/terminal', checkAuth, function(req, res) {

});

app.get('/terminal/:gid', checkAuth, function(req, res) {

    var Guild = {};
    connection.query('SELECT * FROM `guilds` WHERE `guild_id` = ?', [req.guild_id], function(err, results, fields) {
        if (results.length == 0) {
            res.redirect("https://discordapp.com/oauth2/authorize?&client_id=170387125261434880&scope=bot&permissions=3148800&guild_id=" + req.guild_id + "&response_type=code&redirect_uri=http://r3alb0t.xyz/servers");
        }

        if (results.length > 0) {
            if (results[0].guild_avatar != null) {
                Guild.icon = "https://discordapp.com/api/guilds/" + req.guild_id + "/icons/" + results[0].guild_avatar + ".jpg";
            } else {
                Guild.icon = "https://discordapp.com/assets/1cbd08c76f8af6dddce02c5138971129.png";
            }
            Guild.name = results[0].guild_name;
            res.render('terminal.ejs', {
                user: req.user,
                guild: Guild.name,
                icon: Guild.icon,
                gid: req.guild_id,
                playlist: -1
            });
        }
    });
});

app.get('/terminal/:gid/music', checkAuth, function(req, res) {

    var guild = {
        url: 'https://discordapp.com/api/guilds/' + req.guild_id + '/channels',
        headers: {
            'Authorization': 'Bot ' + Auth.token
        }
    };

    var channels;
    var textChnls = [];
    var voiceChnls = [];
    request(guild, function(error, response, body) {
        channels = JSON.parse(body);
        for (var i = 0; i < channels.length; i++) {
            if (channels[i].type == "voice")
                voiceChnls[voiceChnls.length] = channels[i];
            else
                textChnls[textChnls.length] = channels[i];
        }

        console.log(textChnls);
    });
    var playlist;
    var Guild = {};
    connection.query('SELECT * FROM ??', ["'" + req.guild_id.toString() + "'"], function(err, results, fields) {
        playlist = results;
        connection.query('SELECT * FROM `guilds` WHERE `guild_id` = ?', [req.guild_id], function(err, results, fields) {
            if (results[0].guild_avatar != null) {
                Guild.icon = "https://discordapp.com/api/guilds/" + req.guild_id + "/icons/" + results[0].guild_avatar + ".jpg";
            } else {
                Guild.icon = "https://discordapp.com/assets/1cbd08c76f8af6dddce02c5138971129.png";
            }
            Guild.name = results[0].guild_name;
            res.render('terminal.ejs', {
                user: req.user,
                playlist: playlist,
                guild: Guild.name,
                icon: Guild.icon,
                gid: req.guild_id,
                addon: "music"
            });
        });
    });
});

app.get('/terminal/:gid/cmd', checkAuth, function(req, res) {

    checkGuild(req.guild_id, req.user);

    var Guild = {};

    connection.query('SELECT * FROM `guilds` WHERE `guild_id` = ?', [req.guild_id], function(err, results, fields) {
        if (results[0].guild_avatar != null) {
            Guild.icon = "https://discordapp.com/api/guilds/" + req.guild_id + "/icons/" + results[0].guild_avatar + ".jpg";
        } else {
            Guild.icon = "https://discordapp.com/assets/1cbd08c76f8af6dddce02c5138971129.png";
        }
        Guild.name = results[0].guild_name;
        res.render('terminal.ejs', {
            user: req.user,
            playlist: -1,
            guild: Guild.name,
            icon: Guild.icon,
            gid: req.guild_id,
            addon: "cmd"
        });
    });

})




app.param('request', function(req, res, next, code) {
    req.code = code;
    next();
})

app.get('/.well-known/acme-challenge/:request', function(req, res) {
    res.send(req.code);
});


app.listen(3000, function(err) {
    if (err) return console.log(err)
    console.log('Listening at https://r3alb0t.xyz:3000')
});
