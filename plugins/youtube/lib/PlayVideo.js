'use strict';


var Video = require('./Video');
var ytdl = require('ytdl-core');

class PlayVideo extends Video {
    
    constructor(video, usr) {
        super(usr);
        
        this.video = video.replace("https://", "http://");
        
        this.title = this.video;
        this.url = null;
        this.loaded = false;
    }
    
    getData() {
        if(this.loaded) return;
        ytdl.getInfo(this.video, function(err, info) {
            if(err) {
                console.log(err);
            } else {
                this.title = info.title;
                this.url = info.loaderUrl;
                this.loaded = true;
                this.emit('data-changed');
            }
        }.bind(this));
    }
    getTitle() {
        return this.title;
    }
    
    
    setFilter(format) {
        return format.container === 'mp3';
    }
    
    
    createStream() {
        return new Promise(function(resolve, reject) {
            resolve(ytdl(this.video, {fliter: this.setFilter, quality: 'lowest'}));
        }.bind(this));
    }
}


module.exports = PlayVideo;