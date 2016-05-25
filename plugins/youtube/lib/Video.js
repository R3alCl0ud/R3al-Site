'use strict';

var EventEmitter = require('events').EventEmitter;

class Video extends EventEmitter {
    constructor(usr) {
        super();
        if(typeof usr == 'undefined') usr = null;
        this.usr = usr;
    }
    
    init(bot) {
        
    }
    
    getData () {
        this.emit('data-changed');
    }
    
    getTitle () {
        return 'Untitled';    
    }
    
    getFormat() {
        return null;
    }
    
    createStream() {
        return Promise.reject("not playable");
    }
    
    
}

module.exports = Video;