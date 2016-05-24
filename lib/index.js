var music = require('./voice/music');
var scdl = require('./util/soundcloud');
var yt = require('./util/youtube');
var util = require('./util/util');

module.exports = {

    scSong: scdl.handleSClink,
    ytSong: yt.handleYTlink,
    ytSet: yt.ytPlaylist,

    openJSON: util.openJSON,
    writeJSON: util.writeJSON,

    play: music.play,
    playNext: music.playNext,
    playStop: music.playStop,
    pause: music.pause,
    musicEvents: music.musicEvents,

    isRole: util.isRole,
    serverIndex: util.serverIndex

}
