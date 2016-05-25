var lib = require('../../lib');
var PlayVideo = require('./lib/PlayVideo');


exports.start = function()
{
    var plugin = {
        name: "Youtube Player",
        author: "R3alCl0ud & M9"
    }
    return plugin;
}

exports.song = function(bot, video, user)
{
    var yt = null;

    try
    {
        yt = new PlayVideo("https://www.youtube.com/watch?v=SzWk_I304Sg", user);
    }
    catch (err)
    {
        console.log(err);
    }

    yt.getData();

    yt.on('data-changed', function()
    {
        yt.createStream().then(function(stream) {
            var sampleRate = 48000;
            var bitDepth = 16;
            var channels = 2;
            var readSize = sampleRate / 1000 * 60 * bitDepth / 8 * channels;
            stream.once('readable', function () {
                this.encoder = bot.voiceConnection.encoder;
                stream.setEncoding(this.encoder)
                bot.voiceConnection.playRawStream(stream.read());
            }.bind(this));
        });
    });

}